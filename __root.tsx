import {
  Outlet,
  Link,
  createRootRoute,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";

/** Tudo é servido do próprio app: nenhuma origem externa pode ser contatada (offline e sem rastreio). */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' data: blob:",
  "worker-src 'self' blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "form-action 'none'",
  "base-uri 'self'",
].join("; ");

const screen = "flex h-dvh items-center justify-center bg-cream px-4";
const action =
  "glass control inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-bold text-foreground";

function NotFoundComponent() {
  return (
    <div className={screen}>
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-extrabold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Esta página não existe.</p>
        <div className="mt-6">
          <Link to="/" className={action}>
            Voltar para casa
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <div className={screen}>
      <div className="max-w-md text-center">
        <h1 className="text-xl font-extrabold text-foreground">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O DroidNy não conseguiu abrir. Tente novamente ou volte para casa.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className={action}
          >
            Tentar de novo
          </button>
          <a href="/" className={action}>
            Voltar para casa
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { "http-equiv": "Content-Security-Policy", content: CSP },
      { name: "referrer", content: "no-referrer" },
      { title: "DroidNy" },
      { name: "description", content: "A casa do DroidNy, seu companheiro virtual 2D." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: Outlet,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
