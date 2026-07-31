import { User } from 'firebase/auth';

/**
 * Lista inicial de administradores autorizados.
 */
export const adminEmails: string[] = [
  "midiacompartilhada.ead@unimar.br",
  "marcelolindoamorim@gmail.com"
];

export const ADMIN_EMAILS: string[] = adminEmails;

/**
 * Helper para verificar se um e-mail é de administrador.
 */
export function isEmailAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();
  return adminEmails.some(adminEmail => adminEmail.toLowerCase() === normalizedEmail);
}

/**
 * Função de verificação de papel de Administrador.
 * Estrutura preparada para migração futura para Firestore (coleção 'roles' ou 'admins').
 * 
 * @param user Usuário autenticado do Firebase Auth
 * @returns Promise<boolean>
 */
export async function checkIsAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.email) return false;

  // 1. Verificação primária via lista local (Requisito Atual)
  if (isEmailAdmin(user.email)) {
    return true;
  }

  // 2. Estrutura preparada para migração futura para Firestore (coleção 'roles' ou 'admins'):
  /*
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    const userRoleRef = doc(db, 'roles', user.uid);
    const userRoleSnap = await getDoc(userRoleRef);
    if (userRoleSnap.exists() && userRoleSnap.data()?.role === 'admin') {
      return true;
    }
  } catch (error) {
    console.error('Erro ao verificar permissão no Firestore:', error);
  }
  */

  return false;
}
