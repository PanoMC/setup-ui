/**
 * Picks the Step 3 mail service to pre-select from the saved mail settings.
 *
 * `GET /api/setup/step` never returns the SMTP password (it is unauthenticated), so the
 * password is not required here: a saved hostname, sender, username and port are enough to
 * reopen the right service form, and the wizard asks for the password again.
 *
 * @param {{ sender?: string, hostname?: string, username?: string, port?: number } | null | undefined} email
 * @param {Record<string, { config: { hostname?: string } }>} services
 * @returns {string | null} the matching service key, "OTHER" for an unknown host, or null if nothing is saved
 */
export function detectMailService(email, services) {
  const { sender, hostname, username, port } = email ?? {};

  if (!(sender && hostname && username && port)) return null;

  const match = Object.keys(services).find(
    (service) =>
      service !== "OTHER" &&
      services[service].config.hostname?.toLowerCase() ===
        hostname.trim().toLowerCase(),
  );

  return match ?? "OTHER";
}
