/**
 * Configuração Centralizada de Permissões e Lista de Administradores
 * Mídia Compartilhada - Universidade de Marília (UNIMAR)
 */

export const ADMIN_EMAILS: string[] = [
  'midiacompartilhada.ead@unimar.br',
  'eduardo-audit@unimar.br'
];

/**
 * Verifica se um e-mail possui privilégios de Administrador / Auditor
 */
export function isUserAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(normalized);
}
