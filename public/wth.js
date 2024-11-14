// Helper function to parse date strings and calculate difference in days
function parseDate(dateString) {
    return new Date(dateString);
}

function dateDifferenceInDays(date1, date2) {
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Function to create the date mapping
export const mapping = function createDateMapping(oldStart, oldEnd, newStart, newEnd) {
    // Parse the date strings
    const oldStartDate = parseDate(oldStart);
    const oldEndDate = parseDate(oldEnd);
    const newStartDate = parseDate(newStart);
    const newEndDate = parseDate(newEnd);

    // Calculate durations in days
    const oldDuration = dateDifferenceInDays(oldStartDate, oldEndDate) + 1;
    const newDuration = dateDifferenceInDays(newStartDate, newEndDate) + 1;
    const mappingDuration = Math.min(oldDuration, newDuration);

    // Initialize the mapping object
    const dateMapping = {};

    // Loop to generate the mapping for the calculated duration
    for (let i = 0; i < mappingDuration; i++) {
        const oldDate = new Date(oldStartDate);
        oldDate.setDate(oldDate.getDate() + i);

        const newDate = new Date(newStartDate);
        newDate.setDate(newDate.getDate() + i);

        // Format dates to YYYY-MM-DD
        const oldDateString = oldDate.toISOString().split("T")[0];
        const newDateString = newDate.toISOString().split("T")[0];

        // Map old date to new date
        dateMapping[oldDateString] = newDateString;
    }

    return dateMapping;
}

// Example usage
// const oldStart = "2023-01-01";
// const oldEnd = "2023-01-10";
// const newStart = "2024-02-01";
// const newEnd = "2024-02-05";

// const mapping = createDateMapping(oldStart, oldEnd, newStart, newEnd);
// console.log(mapping);
