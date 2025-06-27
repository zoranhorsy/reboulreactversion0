// Force le rendu dynamique - page admin dashboard isolée
export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <title>Tableau de bord - Reboul Store</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            fontFamily: "system-ui, sans-serif",
            backgroundColor: "#f9fafb",
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "2px solid #e5e7eb",
                borderTop: "2px solid #3b82f6",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1rem",
              }}
            ></div>
            <p style={{ color: "#4b5563", margin: "0 0 0.5rem" }}>
              Redirection vers le tableau de bord...
            </p>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", margin: 0 }}>
              Veuillez patienter...
            </p>
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
                        setTimeout(function() {
                            window.location.href = '/admin/dashboard/overview';
                        }, 1000);
                    `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `,
          }}
        />
      </body>
    </html>
  );
}
