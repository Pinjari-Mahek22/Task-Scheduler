import { Assignment, ScheduleItem } from "../types";

/**
 * Format a Date object or ISO string to iCalendar standard UTC timestamp: YYYYMMDDTHHMMSSZ
 */
function formatToIcsDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Generate .ics content for an assignment deadline
 */
export function generateAssignmentIcs(assignment: Assignment): string {
  const startDate = new Date(assignment.dueDate);
  // Default reminder event 1 hour prior
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const startIcs = formatToIcsDate(startDate.toISOString());
  const endIcs = formatToIcsDate(endDate.toISOString());
  const nowIcs = formatToIcsDate(new Date().toISOString());

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EnggNexus//Student Academic Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:assignment-${assignment.id}-${Date.now()}@enggnexus.local`,
    `DTSTAMP:${nowIcs}`,
    `DTSTART:${startIcs}`,
    `DTEND:${endIcs}`,
    `SUMMARY:DEADLINE: ${assignment.title} (${assignment.subject})`,
    `DESCRIPTION:${assignment.description.replace(/\n/g, "\\n")}\\n\\nPriority: ${assignment.priority}\\nSubmission Format: ${assignment.format}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: ${assignment.title} is due in 2 hours!`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Generate bulk .ics file for all pending assignments and weekly schedule
 */
export function generateFullCalendarIcs(assignments: Assignment[], schedules: ScheduleItem[]): string {
  const nowIcs = formatToIcsDate(new Date().toISOString());
  const events: string[] = [];

  // Add assignments
  assignments.forEach((ass) => {
    const startDate = new Date(ass.dueDate);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    events.push(
      [
        "BEGIN:VEVENT",
        `UID:ass-${ass.id}@enggnexus.local`,
        `DTSTAMP:${nowIcs}`,
        `DTSTART:${formatToIcsDate(startDate.toISOString())}`,
        `DTEND:${formatToIcsDate(endDate.toISOString())}`,
        `SUMMARY:[Deadline] ${ass.title}`,
        `DESCRIPTION:Subject: ${ass.subject}\\nStatus: ${ass.status}\\nPriority: ${ass.priority}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
      ].join("\r\n")
    );
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EnggNexus//Complete Student Timetable//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Trigger download of an .ics file in the browser
 */
export function downloadIcsFile(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", filename.endsWith(".ics") ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate direct Google Calendar web link for instant 1-click sync
 */
export function getGoogleCalendarUrl(assignment: Assignment): string {
  const title = encodeURIComponent(`[Deadline] ${assignment.title} - ${assignment.subject}`);
  const details = encodeURIComponent(
    `${assignment.description}\n\nPriority: ${assignment.priority}\nFormat: ${assignment.format}\nStatus: ${assignment.status}\nOrganized via EnggNexus Student Hub`
  );
  const start = formatToIcsDate(assignment.dueDate);
  const end = formatToIcsDate(new Date(new Date(assignment.dueDate).getTime() + 60 * 60 * 1000).toISOString());

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`;
}
