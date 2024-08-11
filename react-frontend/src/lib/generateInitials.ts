export default function generateInitials(
  name: string | null | undefined
): string {
  if (!name) {
    return "N/A";
  }
  const names = name.trim().split(/\s+/);

  if (names.length < 2) {
    // If less than 2 names, return the initial of the first name
    return names[0][0].toUpperCase();
  }

  // If more than 2 names, ignore the extra names and consider only the first two
  const firstName = names[0];
  const secondName = names[1];

  // Return initials of the first two names
  return `${firstName[0].toUpperCase()}${secondName[0].toUpperCase()}`;
}
