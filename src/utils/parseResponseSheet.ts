import { ParsedQuestion, ParseResult, ExamMeta, Subject } from '@/types';

/**
 * Decodes Quoted-Printable encoding commonly found in MHTML files.
 */
function decodeQuotedPrintable(input: string): string {
  // Remove soft line breaks (an '=' at the end of a line)
  let output = input.replace(/=\r?\n/g, '');
  // Decode hex values (e.g., =3D -> =)
  output = output.replace(/=([0-9A-Fa-f]{2})/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  return output;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts the raw HTML content from an MHTML string.
 * If the input is not MHTML, it returns the input unchanged.
 */
export function extractHtmlFromMhtml(mhtmlContent: string): string {
  // Find the first boundary
  const boundaryMatch = mhtmlContent.match(/boundary="?([^"\r\n]+)"?/i);
  if (!boundaryMatch) {
    // Doesn't look like an MHTML multipart file; return as-is
    return mhtmlContent;
  }
  
  const boundary = boundaryMatch[1];
  const escapedBoundary = escapeRegExp(boundary);
  const parts = mhtmlContent.split(new RegExp(`--${escapedBoundary}`, 'i'));
  
  // Look for the part that has Content-Type: text/html
  for (const part of parts) {
    if (part.toLowerCase().includes('content-type: text/html')) {
      // Find where the headers end and the content begins (\r\n\r\n or \n\n)
      const headerEndIndex = part.indexOf('\r\n\r\n');
      const headerEndIndexLF = part.indexOf('\n\n');
      
      let contentStartIndex = -1;
      if (headerEndIndex !== -1) {
        contentStartIndex = headerEndIndex + 4;
      } else if (headerEndIndexLF !== -1) {
        contentStartIndex = headerEndIndexLF + 2;
      }
      
      if (contentStartIndex !== -1) {
        const rawHtml = part.substring(contentStartIndex);
        // Decode quoted-printable if it's encoded that way
        if (part.toLowerCase().includes('content-transfer-encoding: quoted-printable')) {
          return decodeQuotedPrintable(rawHtml);
        }
        return rawHtml;
      }
    }
  }
  
  return mhtmlContent;
}

/**
 * Maps raw section names from the CET response sheet HTML to Subject types.
 */
function mapSectionToSubject(section: string): Subject {
  const normalized = section.trim().toUpperCase();
  switch (normalized) {
    case 'PHYSICS':
      return 'Physics';
    case 'CHEMISTRY':
      return 'Chemistry';
    case 'MATHEMATICS':
      return 'Mathematics';
    default:
      throw new Error(`Unknown section: ${section}`);
  }
}

/**
 * Extracts text content from a span element that follows a bold label
 * within the given HTML element.
 */
function extractLabeledValue(container: Element, label: string): string | null {
  const boldElements = container.querySelectorAll('b');
  for (const b of Array.from(boldElements)) {
    if (b.textContent?.includes(label)) {
      // The value is in the next sibling <span>
      const parentCell = b.closest('td') || b.closest('th') || b.parentElement;
      if (!parentCell) continue;

      // Find the span that follows the bold label
      const spans = parentCell.querySelectorAll('span');
      for (const span of Array.from(spans)) {
        // Check if this span comes after the bold element
        if (
          b.compareDocumentPosition(span) & Node.DOCUMENT_POSITION_FOLLOWING
        ) {
          return span.textContent?.trim() || null;
        }
      }
    }
  }
  return null;
}

/**
 * Extracts candidate info from the navbar span.
 * Expected format: "2617029270 - DUBEY ADARSH SUSHIL KUMAR "
 */
function extractCandidateInfo(doc: Document): { name: string; applicationNumber: string } {
  const navSpan = doc.querySelector('span.hidden-sm.hidden-md');
  if (!navSpan || !navSpan.textContent) {
    return { name: '', applicationNumber: '' };
  }

  const text = navSpan.textContent.trim();
  const dashIndex = text.indexOf(' - ');
  if (dashIndex === -1) {
    return { name: text, applicationNumber: '' };
  }

  const applicationNumber = text.substring(0, dashIndex).trim();
  const name = text.substring(dashIndex + 3).trim();
  return { name, applicationNumber };
}

/**
 * Extracts the exam code from anchor hrefs in the document.
 * Looks for patterns like "/PCM-YCUEP29V/" in href attributes.
 */
function extractExamCode(doc: Document): string {
  const anchors = doc.querySelectorAll('a[href]');
  for (const anchor of Array.from(anchors)) {
    const href = anchor.getAttribute('href') || '';
    // Match patterns like /PCM-YCUEP29V/ in the URL path
    const match = href.match(/\/([A-Z]+-[A-Z0-9]+)\//);
    if (match) {
      return match[1];
    }
  }
  return '';
}

/**
 * Parses an MHT CET response sheet HTML file and extracts all question data
 * along with candidate metadata.
 *
 * @param htmlContent - Raw HTML string from the CET response sheet page
 * @returns ParseResult containing parsed questions and exam metadata
 * @throws Error if the HTML structure is invalid or the objection table is not found
 */
export function parseResponseSheet(fileContent: string): ParseResult {
  try {
    // If the file is MHTML, extract the underlying HTML first
    const htmlContent = extractHtmlFromMhtml(fileContent);

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Find the main question table
    const table = doc.getElementById('tblObjection');
    if (!table) {
      throw new Error(
        'Could not find the response table (tblObjection). Please ensure you uploaded a valid MHT CET response sheet.'
      );
    }

    const allRows = Array.from(table.querySelectorAll('tr'));
    const rows = allRows.filter(row => {
      const closestTable = row.closest('table');
      return closestTable === table;
    });
    const questions: ParsedQuestion[] = [];

    // Skip header row (index 0), iterate over question rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = Array.from(row.children).filter(
        child => child.tagName.toLowerCase() === 'td'
      ) as HTMLTableCellElement[];

      // Each valid question row must have at least 3 cells
      if (cells.length < 3) {
        continue;
      }

      const questionId = cells[0].textContent?.trim() || '';
      const sectionName = cells[1].textContent?.trim() || '';

      if (!questionId || !sectionName) {
        continue;
      }

      // Map section name to Subject type
      let subject: Subject;
      try {
        subject = mapSectionToSubject(sectionName);
      } catch {
        // Skip rows with unrecognized section names
        continue;
      }

      // Extract correct option and candidate response from the nested table in td[2]
      const questionCell = cells[2];
      const correctOption = extractLabeledValue(questionCell, 'Correct Option:') || '';
      let candidateResponse = extractLabeledValue(questionCell, 'Candidate Response:');

      // Treat empty or whitespace-only responses as unanswered (null)
      if (candidateResponse !== null && candidateResponse.trim() === '') {
        candidateResponse = null;
      } else if (candidateResponse !== null) {
        candidateResponse = candidateResponse.trim();
      }

      questions.push({
        questionId,
        subject,
        correctOption,
        candidateResponse,
      });
    }

    if (questions.length === 0) {
      throw new Error(
        'No questions found in the response sheet. The file may be empty or in an unexpected format.'
      );
    }

    // Extract metadata
    const candidateInfo = extractCandidateInfo(doc);
    const examCode = extractExamCode(doc);

    const meta: ExamMeta = {
      candidateName: candidateInfo.name,
      applicationNumber: candidateInfo.applicationNumber,
      examCode,
      totalQuestions: questions.length,
    };

    return { questions, meta, htmlContent };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while parsing the response sheet.');
  }
}
