import { Configuration, PublicClientApplication } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: "e79c5276-4218-4c79-8e9f-6bfe8f3d755c",
    authority: "https://login.microsoftonline.com/a835aabf-a16a-4ba6-83e7-0ddfc5fd325e",
    redirectUri: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    navigateToLoginRequestUrl: false,
  } as any,
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  } as any,
  system: {
    allowRedirectInIframe: true,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Tratamento de erro no handleRedirectPromise() com inicialização prévia do MSAL e substituição do histórico
if (typeof window !== "undefined") {
  msalInstance.initialize()
    .then(() => msalInstance.handleRedirectPromise())
    .then((response) => {
      if (response) {
        console.log("Autenticação MSAL concluída com sucesso:", response.account?.username);
      }
      // Limpa os fragmentos de callback do MSAL na URL substituindo o histórico (replaceState) para não criar entrada extra
      if (window.location.hash || window.location.search.includes("code=") || window.location.search.includes("state=")) {
        window.history.replaceState(
          { view: 'home' },
          document.title,
          window.location.pathname
        );
      }
    })
    .catch((error) => {
      console.error("Erro ao processar retorno do redirecionamento MSAL:", error);
    });
}

export const loginRequest = {
  scopes: ["User.Read", "email", "profile", "openid"],
  prompt: "select_account",
};

