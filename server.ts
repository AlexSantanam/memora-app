import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import dotenv from "dotenv";

dotenv.config();

// Email Receipts (Resend) — https://resend.com/api-keys
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RECEIPT_FROM_EMAIL = process.env.RECEIPT_FROM_EMAIL || "MEMORA <onboarding@resend.dev>";
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

if (!RESEND_API_KEY) {
  console.warn("⚠️  RESEND_API_KEY not set in .env — payment receipt emails will not be sent.");
}

// Supabase (service role — server-only, bypasses Row Level Security).
// Never expose SUPABASE_SERVICE_ROLE_KEY to the client bundle (no VITE_ prefix).
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
        // Node 20 lacks a native WebSocket global; supply `ws` so the realtime
        // client (initialized unconditionally by supabase-js) doesn't crash at startup.
        realtime: { transport: WebSocket as any },
      })
    : null;

if (!supabaseAdmin) {
  console.warn("⚠️  SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set in .env — database features disabled.");
}

interface ReceiptEmailParams {
  userEmail: string;
  userName?: string;
  planName?: string;
  amountCLP?: number;
  currency?: "CLP" | "USD";
  invoiceNumber?: string;
  paymentMethod?: string;
}

async function sendReceiptEmail(params: ReceiptEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const { userEmail, userName, planName, amountCLP, currency = "CLP", invoiceNumber, paymentMethod } = params;

  if (!userEmail) return { success: false, error: "userEmail es requerido." };
  if (!resend) {
    console.warn("[Receipt Email] Resend no configurado — omitiendo envío para", userEmail);
    return { success: false, error: "Servicio de correo no configurado." };
  }

  const formattedAmount =
    currency === "USD"
      ? `US$${Number(amountCLP || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `$${Number(amountCLP || 0).toLocaleString("es-CL")} CLP`;
  const paidAt = new Date().toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });

  const html = `
  <div style="background-color:#FAF7F2;padding:40px 16px;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #EAE3D9;">
      <div style="background-color:#24201D;padding:32px 32px 28px;text-align:center;">
        <div style="font-family:Georgia,serif;font-size:22px;color:#ffffff;letter-spacing:1px;">MEMORA</div>
        <div style="font-family:Arial,sans-serif;font-size:10px;color:#C5A880;letter-spacing:2px;text-transform:uppercase;margin-top:2px;">Recuerdos para siempre</div>
      </div>
      <div style="padding:32px;">
        <p style="font-family:Arial,sans-serif;font-size:11px;color:#7A4E38;text-transform:uppercase;letter-spacing:1px;font-weight:bold;margin:0 0 4px;">Comprobante de pago</p>
        <h1 style="font-family:Georgia,serif;font-size:22px;color:#24201D;margin:0 0 16px;font-weight:normal;">¡Gracias, ${userName || "familia MEMORA"}!</h1>
        <p style="font-family:Arial,sans-serif;font-size:13px;color:#5C534B;line-height:1.6;margin:0 0 24px;">
          Hemos recibido tu pago y tu plan ya está activo. A continuación el detalle de tu comprobante.
        </p>
        <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;color:#24201D;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #F4EFEA;color:#8C827A;">Plan</td>
            <td style="padding:10px 0;border-bottom:1px solid #F4EFEA;text-align:right;font-weight:bold;">${planName || "MEMORA"}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #F4EFEA;color:#8C827A;">Monto pagado</td>
            <td style="padding:10px 0;border-bottom:1px solid #F4EFEA;text-align:right;font-weight:bold;">${formattedAmount}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #F4EFEA;color:#8C827A;">Fecha</td>
            <td style="padding:10px 0;border-bottom:1px solid #F4EFEA;text-align:right;">${paidAt}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #F4EFEA;color:#8C827A;">Método de pago</td>
            <td style="padding:10px 0;border-bottom:1px solid #F4EFEA;text-align:right;">${paymentMethod || "Flow"}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#8C827A;">N° de orden</td>
            <td style="padding:10px 0;text-align:right;font-family:monospace;">${invoiceNumber || "—"}</td>
          </tr>
        </table>
        <p style="font-family:Arial,sans-serif;font-size:12px;color:#8C827A;line-height:1.6;margin:28px 0 0;">
          Si tienes dudas sobre este cobro, respóndenos a este correo o escríbenos por WhatsApp. Gracias por confiar en MEMORA para conservar su historia.
        </p>
      </div>
      <div style="background-color:#F4EFEA;padding:16px 32px;text-align:center;font-family:Arial,sans-serif;font-size:10px;color:#8C827A;">
        © ${new Date().getFullYear()} MEMORA · Este comprobante fue generado automáticamente.
      </div>
    </div>
  </div>`;

  try {
    const { data, error } = await resend.emails.send({
      from: RECEIPT_FROM_EMAIL,
      to: userEmail,
      subject: `Comprobante de pago — ${planName || "MEMORA"} (${formattedAmount})`,
      html,
    });

    if (error) {
      console.error("[Receipt Email] Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Receipt Email] Sent to ${userEmail} (id: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[Receipt Email] Send failed:", err);
    return { success: false, error: err?.message };
  }
}

// Flow Payments Configuration (Chile: Webpay Plus, Redcompra, Servipag, Mach, etc.)
// Credentials must come from .env (never hardcode secrets here).
const FLOW_API_KEY = process.env.FLOW_API_KEY || "";
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY || "";
const FLOW_ENV = process.env.FLOW_ENVIRONMENT || "sandbox";
const FLOW_BASE_URL = FLOW_ENV === "sandbox" ? "https://sandbox.flow.cl/api" : "https://www.flow.cl/api";

if (!FLOW_API_KEY || !FLOW_SECRET_KEY) {
  console.warn("⚠️  FLOW_API_KEY / FLOW_SECRET_KEY not set in .env — payment routes will fail.");
}

// PayPal (international payments, outside Chile) — https://developer.paypal.com
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const PAYPAL_ENV = process.env.PAYPAL_ENVIRONMENT || "sandbox";
const PAYPAL_BASE_URL = PAYPAL_ENV === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.warn("⚠️  PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET not set in .env — PayPal routes will fail.");
}

// USD pricing — deliberately higher than the raw CLP->USD conversion: covers
// PayPal's per-transaction fee (which would otherwise eat most of a ~$1 charge)
// and avoids a price so low it reads as untrustworthy to a US/EU buyer.
const PAYPAL_PLAN_PRICES_USD: Record<string, string> = {
  esencial: "3.99",
  familia: "9.99",
  legado: "24.99",
  para_siempre: "9.99",
  acompanado: "24.99",
};

// Mercado Pago (Chile + rest of Latam) — https://www.mercadopago.cl/developers
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
const MERCADOPAGO_ENV = process.env.MERCADOPAGO_ENVIRONMENT || "sandbox";
const MERCADOPAGO_BASE_URL = "https://api.mercadopago.com";

if (!MERCADOPAGO_ACCESS_TOKEN) {
  console.warn("⚠️  MERCADOPAGO_ACCESS_TOKEN not set in .env — Mercado Pago routes will fail.");
}

// Same CLP pricing as Flow (see /api/payments/flow/create-order) — Mercado
// Pago is offered as an alternative Chilean gateway, not a different market.
const MERCADOPAGO_PLAN_PRICES_CLP: Record<string, number> = {
  esencial: 990,
  familia: 4900,
  legado: 14900,
  para_siempre: 4900,
  acompanado: 14900,
};

async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const rawBody = await res.text();
  if (!res.ok) {
    console.error(`[PayPal OAuth] HTTP ${res.status} — first 500 chars:`, rawBody.slice(0, 500));
    throw new Error(`PayPal OAuth failed: ${res.status}`);
  }
  let data: any;
  try {
    data = JSON.parse(rawBody);
  } catch {
    console.error(`[PayPal OAuth Non-JSON Response] HTTP ${res.status} — first 500 chars:`, rawBody.slice(0, 500));
    throw new Error("PayPal OAuth returned a non-JSON response");
  }
  return data.access_token;
}

function signFlowParams(params: Record<string, string | number>, secretKey: string): string {
  const sortedKeys = Object.keys(params).sort();
  let toSign = "";
  for (const key of sortedKeys) {
    toSign += `${key}${params[key]}`;
  }
  return crypto.createHmac("sha256", secretKey).update(toSign).digest("hex");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

// Tries Gemini first (so it starts working again automatically whenever
// Google lifts the current account-level block, no code change needed),
// then falls back to Groq (Llama 3.3 70B, free tier) if Gemini is
// unavailable or fails. Returns null if both fail, so callers can fall
// back to the local template.
async function generateJsonWithAI(prompt: string): Promise<any | null> {
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      return JSON.parse(response.text || "{}");
    } catch (err: any) {
      console.warn("Gemini call failed, trying Groq:", err?.message || err);
    }
  }

  if (GROQ_API_KEY) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          // Groq's strict json_object mode fails on this prompt's larger nested
          // output (a long biography embedded in a JSON structure) — the prompt
          // already asks for JSON explicitly, so parse loosely instead, stripping
          // a markdown code fence if the model wraps its answer in one.
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `Groq HTTP ${res.status}`);
      const raw = data.choices?.[0]?.message?.content || "{}";
      const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
      return JSON.parse(jsonText);
    } catch (err: any) {
      console.warn("Groq call failed, using local fallback:", err?.message || err);
    }
  }

  return null;
}

async function startServer() {
  const app = express();
  // Hosting platforms (Railway, Render, etc.) assign the port dynamically via
  // process.env.PORT — 3000 is only a fallback for local development.
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Digital Asset Links — proves memora.lat and the Android app (TWA) belong
  // to the same owner, so the app opens the site full-screen with no browser
  // UI instead of falling back to a regular Custom Tab. ANDROID_APP_SHA256_FINGERPRINT
  // gets set once the signing key exists (see twa-manifest.json); the route
  // is harmless and simply empty until then.
  app.get("/.well-known/assetlinks.json", (_req, res) => {
    const fingerprint = process.env.ANDROID_APP_SHA256_FINGERPRINT || "";
    const entries = fingerprint
      ? [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
              namespace: "android_app",
              package_name: "lat.memora.twa",
              sha256_cert_fingerprints: [fingerprint],
            },
          },
        ]
      : [];
    res.header("Content-Type", "application/json");
    res.json(entries);
  });

  // Sitemap — only memorials the owner has actually chosen to make public and
  // published belong here. "unlisted"/"private"/"password" memorials must
  // never appear (that's the whole point of those privacy levels: reachable
  // only by direct link, never discoverable via search).
  app.get("/sitemap.xml", async (_req, res) => {
    const origin = process.env.APP_URL || "https://memora.lat";
    const staticUrls = [`${origin}/`, `${origin}/codigo-qr-memorial`];

    let memorialUrls: string[] = [];
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("memorials")
        .select("slug, updated_at")
        .eq("privacy", "public")
        .eq("status", "published");
      if (!error && data) {
        memorialUrls = data.map((m) => `${origin}/m/${m.slug}`);
      }
    }

    const allUrls = [...staticUrls, ...memorialUrls];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  });

  // API Health Check
  app.get("/api/health", async (_req, res) => {
    let supabaseReachable: boolean | null = null;
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
      supabaseReachable = !error;
    }
    res.json({
      status: "ok",
      appName: "MEMORA",
      timestamp: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      groqConfigured: !!GROQ_API_KEY,
      flowConfigured: !!FLOW_API_KEY && !!FLOW_SECRET_KEY,
      flowEnvironment: FLOW_ENV,
      paypalConfigured: !!PAYPAL_CLIENT_ID && !!PAYPAL_CLIENT_SECRET,
      paypalEnvironment: PAYPAL_ENV,
      mercadopagoConfigured: !!MERCADOPAGO_ACCESS_TOKEN,
      mercadopagoEnvironment: MERCADOPAGO_ENV,
      supabaseConfigured: !!supabaseAdmin,
      supabaseReachable,
    });
  });


  // AI Biography Assistant Route (Ayúdame a contar su historia)
  app.post("/api/gemini/biography-assist", async (req, res) => {
    try {
      const {
        personName,
        memorialType = "person",
        species,
        breed,
        birthDate,
        passingDate,
        birthPlace,
        notes,
        passions,
        familyDetails,
        keyMilestones,
        personality,
        favoriteThings,
        favoritePlace,
        anecdote,
        arrivalStory,
        specialTrait,
        tone = "calido", // calido | clasico | intimo | poetico
      } = req.body;

      if (!personName) {
        return res.status(400).json({ error: "El nombre es requerido." });
      }

      const isPet = memorialType === "pet";

      const prompt = isPet
        ? `Actúa como un redactor biográfico y conmemorativo profundamente empático, respetuoso y sensible para una plataforma conmemorativa llamada MEMORA Mascotas.
Tu tarea es transformar las anécdotas, recuerdos y detalles de "${personName}" (especie: ${species || "Mascota / Animal de compañía"}, raza: ${breed || "No especificada"}) en una historia de vida conmovedora, digna y hermosa que celebre su lugar irremplazable como miembro amado de la familia.

INFORMACIÓN PROPORCIONADA:
- Nombre: ${personName}
- Especie y Raza: ${species || "Compañero animal"} · ${breed || "Mestizo / Único"}
- Fecha de nacimiento / llegada: ${birthDate || "No especificado"}
- Fecha de despedida: ${passingDate || "No especificado"}
- Personalidad: ${personality || "Noble, alegre y cariñoso"}
- Lo que le encantaba: ${favoriteThings || "Pasear, jugar y estar cerca de su familia"}
- Su lugar favorito: ${favoritePlace || "Un rincón cálido del hogar"}
- Travesura o anécdota inolvidable: ${anecdote || "Momentos llenos de ternura y juego"}
- ¿Cómo llegó a la familia?: ${arrivalStory || "Llegó para transformar la vida de su hogar"}
- ¿Qué lo/la hacía especial?: ${specialTrait || "Su lealtad y amor incondicional"}
- Notas y recuerdos libres: ${notes || ""}
- Tono solicitado: ${tone} (Elegante, cálido, familiar, respetuoso, nunca infantilizado ni caricaturesco)

REGLAS ESTRICTAS:
1. Trata a la mascota como lo que representa: un compañero de vida noble y un miembro fundamental de la familia.
2. NO uses diminutivos excesivos ni lenguaje infantilizado. Mantén la elegancia, calidez y carácter premium de MEMORA.
3. La biografía debe ser extensa y detallada: escribe entre 5 y 7 párrafos completos (mínimo 500-600 palabras en total). Desarrolla cada idea con profundidad y detalle sensorial — no resumas en una sola frase lo que puede convertirse en un párrafo evocador. Estructura sugerida: su llegada y primeras impresiones, su personalidad y costumbres del día a día, momentos y aventuras felices, su vínculo con cada miembro de la familia, y un cierre de gratitud y recuerdo eterno.
4. Proporciona una cita conmemorativa hermosa (1-2 frases).
5. Proporciona de 2 a 4 hitos sugeridos para su línea de tiempo (ej. Su llegada a casa, Aventuras compartidas, Los años dorados).

Devuelve la respuesta en formato JSON con la siguiente estructura exacta:
{
  "biography": "Texto completo de la historia estructurada...",
  "shortSummary": "Resumen breve de 2 líneas para la cabecera...",
  "memorialQuote": "Frase emotiva para recordar su compañía y amor...",
  "suggestedMilestones": [
    { "year": "${birthDate ? birthDate.split("-")[0] : "2015"}", "title": "...", "description": "..." }
  ]
}`
        : `Actúa como un redactor biográfico empático, respetuoso y sensible para una plataforma conmemorativa llamada MEMORA.
Tu tarea es convertir las notas e información fragmentada proporcionada por los familiares en una biografía fluida, hermosa y profundamente digna para el memorial digital de "${personName}".

INFORMACIÓN PROPORCIONADA:
- Nombre: ${personName}
- Nacimiento: ${birthDate || "No especificado"} en ${birthPlace || "No especificado"}
- Fallecimiento: ${passingDate || "No especificado"}
- Notas y anécdotas: ${notes || "Persona muy querida por su familia y amigos."}
- Pasiones e intereses: ${passions || "No especificado"}
- Familia y vínculos: ${familyDetails || "No especificado"}
- Hitos importantes: ${keyMilestones || "No especificado"}
- Tono solicitado: ${tone} (Opciones: calido = emotivo y cercano, clasico = elegante y formal, intimo = familiar y tierno, poetico = reflexivo y sereno)

REGLAS ESTRICTAS:
1. NUNCA inventes fechas, nombres de familiares ni hechos históricos que no se mencionen.
2. Mantén un tono de celebración de vida, gratitud, amor y paz. Evita dramatismos innecesarios.
3. La biografía debe ser extensa y detallada: escribe entre 5 y 7 párrafos completos (mínimo 500-600 palabras en total). Desarrolla cada idea con profundidad en vez de resumirla en una sola frase — expande cada nota o anécdota entregada en un párrafo evocador propio. Estructura sugerida: introducción y orígenes, trayectoria de vida y pasiones, vínculos familiares y de amistad, legado y forma de ser recordado(a), cierre de gratitud y memoria eterna.
4. Proporciona además una cita conmemorativa corta (1-2 frases) que capture su esencia.
5. Proporciona una lista de 3 a 5 momentos o hitos sugeridos para la línea de tiempo.

Devuelve la respuesta en formato JSON con la siguiente estructura exacta:
{
  "biography": "Texto completo de la biografía estructurada...",
  "shortSummary": "Resumen breve de 2-3 líneas para la cabecera...",
  "memorialQuote": "Frase emotiva para recordar su esencia...",
  "suggestedMilestones": [
    { "year": "1954", "title": "...", "description": "..." }
  ]
}`;

      const aiResult = await generateJsonWithAI(prompt);
      if (aiResult) {
        return res.json({ success: true, data: aiResult });
      }

      if (isPet) {
        const petBio = `${personName} fue mucho más que una mascota; fue un compañero leal de vida, un consuelo en los días difíciles y una fuente inagotable de alegría para toda la familia.\n\n${
          arrivalStory ? arrivalStory + ". " : ""
        }${
          personality ? `Se caracterizaba por su personalidad ${personality.toLowerCase()}, ` : "Con un carácter dulce y entrañable, "
        }${
          favoriteThings ? `disfrutando intensamente de ${favoriteThings.toLowerCase()}. ` : ""
        }${
          favoritePlace ? `Su rincón predilecto siempre fue ${favoritePlace.toLowerCase()}. ` : ""
        }${
          anecdote ? `Entre tantas vivencias, la familia siempre recordará con una sonrisa aquella vez que ${anecdote.toLowerCase()}. ` : ""
        }${
          specialTrait ? `Lo que lo hacía verdaderamente inolvidable era que ${specialTrait.toLowerCase()}. ` : ""
        }\n\nGracias por tu lealtad incondicional, por cada mirada llena de cariño y por enseñarnos el valor del amor más puro. Tu huella permanecerá por siempre en nuestro hogar y en nuestros corazones.`;

        return res.json({
          success: true,
          data: {
            biography: petBio,
            shortSummary: `En memoria amorosa de ${personName}, un compañero fiel y un amor para siempre en el corazón de nuestra familia.`,
            memorialQuote: `"Hay seres que no necesitan hablar para enseñarnos lo que es el amor incondicional."`,
            suggestedMilestones: [
              {
                year: birthDate ? birthDate.split("-")[0] || "2015" : "2015",
                title: "Llegada al hogar",
                description: arrivalStory || `El día que ${personName} se unió a la familia.`,
              },
              {
                year: "Aventuras compartidas",
                title: "Juegos y momentos felices",
                description: favoriteThings || "Paseos, juegos y cariños compartidos cada día.",
              },
              {
                year: passingDate ? passingDate.split("-")[0] || "2024" : "2024",
                title: "Amor para siempre",
                description: "Un legado de lealtad y ternura que vivirá eternamente.",
              },
            ],
          },
        });
      }

      // Contextual Person Fallback
      const fallbackBio = `${personName} iluminó la vida de quienes tuvieron el privilegio de caminar a su lado. ${
        birthPlace ? `Nacido(a) en ${birthPlace}, ` : ""
      }${notes ? notes : "Su generosidad, su sonrisa y su forma de estar presente dejaron una huella imborrable en el corazón de su familia y amigos."} ${
        passions ? `Encontró siempre alegría en ${passions}, compartiendo su entusiasmo con generosidad.` : ""
      } ${
        familyDetails ? `Su mayor tesoro fue siempre su familia: ${familyDetails}.` : ""
      }\n\nHoy celebramos no solo su recuerdo, sino el legado de amor, enseñanzas y momentos compartidos que seguirán viviendo por siempre en nuestras conversaciones y corazones.`;

      return res.json({
        success: true,
        data: {
          biography: fallbackBio,
          shortSummary: `En memoria entrañable de ${personName}, cuya luz y amor permanecen en cada recuerdo compartido.`,
          memorialQuote: `"Los recuerdos que sembramos con amor son eternos en el jardín de la memoria."`,
          suggestedMilestones: [
            {
              year: birthDate ? birthDate.split("-")[0] || "1950" : "1950",
              title: "Comienzo de un camino",
              description: `Nacimiento de ${personName}${birthPlace ? ` en ${birthPlace}` : ""}.`,
            },
            {
              year: "Años de juventud",
              title: "Vocación y pasiones",
              description: passions || "Dedicación y amor por lo que hacía.",
            },
            {
              year: "Legado familiar",
              title: "Momentos inolvidables",
              description: "Una vida dedicada al cuidado y unión de sus seres queridos.",
            },
          ],
        },
      });
    } catch (err: any) {
      console.error("Error in biography-assist route:", err);
      res.status(500).json({ error: "Error al procesar la asistencia biográfica." });
    }
  });

  // AI Tribute Message Assistant
  app.post("/api/gemini/tribute-assist", async (req, res) => {
    try {
      const { memorialName, relationship, userNotes, emotion } = req.body;

      const prompt = `Ayuda a un familiar o amigo a redactar un mensaje de homenaje o condolencia sincero y respetuoso para el memorial digital de "${memorialName}".
Relación con la persona: ${relationship || "Familiar o amigo"}
Sentimiento o anécdota: ${userNotes || "Deseo expresar gratitud y amor por los momentos vividos"}
Tono deseado: ${emotion || "afectuoso y reconfortante"}

Genera 3 opciones de mensajes diferentes en formato JSON:
{
  "options": [
    { "id": "1", "title": "Cálido y familiar", "text": "..." },
    { "id": "2", "title": "Poético y reflexivo", "text": "..." },
    { "id": "3", "title": "Breve y sentido", "text": "..." }
  ]
}`;

      const aiResult = await generateJsonWithAI(prompt);
      if (aiResult) {
        return res.json({ success: true, data: aiResult });
      }

      return res.json({
        success: true,
        data: {
          options: [
            {
              id: "1",
              title: "Cálido y familiar",
              text: `Querido(a) ${memorialName}, tu presencia y tu cariño siempre formarán parte de nosotros. Gracias por cada sonrisa, cada conversación y por enseñarnos el verdadero valor de la familia. Descansa en paz.`,
            },
            {
              id: "2",
              title: "Poético y reflexivo",
              text: `Hay seres que dejan una luz tan hermosa que jamás se apaga. Gracias, ${memorialName}, por iluminar nuestros días con tu bondad. Tu memoria vive en cada atardecer y en cada recuerdo que atesoramos.`,
            },
            {
              id: "3",
              title: "Breve y sentido",
              text: `Siempre en nuestros corazones, querido(a) ${memorialName}. Tu ejemplo y tu amor nos acompañarán cada día.`,
            },
          ],
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Error generando sugerencias de homenaje." });
    }
  });

  // ==========================================
  // FLOW PAYMENT GATEWAY INTEGRATION (CHILE)
  // ==========================================

  // Flow Public Configuration
  app.get("/api/payments/flow/config", (_req, res) => {
    res.json({
      configured: !!FLOW_API_KEY && !!FLOW_SECRET_KEY,
      environment: FLOW_ENV,
      currency: "CLP",
      methods: [
        { id: "webpay", name: "Webpay Plus (Débito y Crédito)", badge: "Transbank" },
        { id: "redcompra", name: "Redcompra Débito", badge: "Transbank" },
        { id: "servipag", name: "Servipag", badge: "Bancos e Instituciones" },
        { id: "mach", name: "MACH / Fpay", badge: "Billeteras Digitales" },
        { id: "multicaja", name: "Multicaja / Klap", badge: "Efectivo y Transferencia" },
      ],
    });
  });

  // Create Flow Payment Order
  app.post("/api/payments/flow/create-order", async (req, res) => {
    try {
      const { planId, memorialId, userEmail, userName } = req.body;

      // New Commercial Plans Pricing (CLP)
      const planPricesCLP: Record<string, number> = {
        esencial: 990,
        familia: 4900,
        legado: 14900,
        // Legacy aliases
        para_siempre: 4900,
        acompanado: 14900,
      };

      const planTitles: Record<string, string> = {
        esencial: "MEMORA Esencial ($990 CLP/año)",
        familia: "MEMORA Familia ($4.900 CLP/año)",
        legado: "MEMORA Legado ($14.900 CLP/año)",
        para_siempre: "MEMORA Familia ($4.900 CLP/año)",
        acompanado: "MEMORA Legado ($14.900 CLP/año)",
      };

      const normalizedPlan = planId === "para_siempre" ? "familia" : planId === "acompanado" ? "legado" : (planId || "familia");
      if (!planPricesCLP[normalizedPlan]) {
        return res.status(400).json({ success: false, error: `Plan desconocido: ${planId}` });
      }
      const amount = planPricesCLP[normalizedPlan];
      const planName = planTitles[normalizedPlan] ?? "MEMORA Familia";

      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const origin = process.env.APP_URL || `${protocol}://${host}`;

      const commerceOrder = `MEMORA-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const flowParams: Record<string, any> = {
        amount,
        apiKey: FLOW_API_KEY,
        commerceOrder,
        currency: "CLP",
        email: userEmail || "contacto@memora.cl",
        optional: JSON.stringify({
          planId: planId || "para_siempre",
          memorialId: memorialId || "",
          userEmail: userEmail || "",
          userName: userName || "Cliente Memora",
        }),
        subject: `MEMORA - ${planName}`,
        urlConfirmation: `${origin}/api/payments/flow/confirmation`,
        urlReturn: `${origin}/api/payments/flow/return`,
      };

      // Sign with HMAC-SHA256
      flowParams.s = signFlowParams(flowParams, FLOW_SECRET_KEY);

      const urlParams = new URLSearchParams();
      for (const [k, v] of Object.entries(flowParams)) {
        urlParams.append(k, String(v));
      }

      console.log(`[Flow] Creating payment order ${commerceOrder} for ${flowParams.email} ($${amount} CLP)`);

      try {
        const flowResponse = await fetch(`${FLOW_BASE_URL}/payment/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: urlParams.toString(),
        });

        const rawBody = await flowResponse.text();
        let flowData: any;
        try {
          flowData = JSON.parse(rawBody);
        } catch {
          console.error(
            `[Flow Non-JSON Response] HTTP ${flowResponse.status} from ${FLOW_BASE_URL}/payment/create — first 500 chars:`,
            rawBody.slice(0, 500)
          );
          return res.status(500).json({
            success: false,
            error: "Flow devolvió una respuesta inesperada (no JSON). Puede ser un bloqueo de red del lado de Flow.",
            httpStatus: flowResponse.status,
          });
        }

        if (flowData.url && flowData.token) {
          const redirectUrl = `${flowData.url}?token=${flowData.token}`;
          return res.json({
            success: true,
            redirectUrl,
            flowToken: flowData.token,
            flowOrder: flowData.flowOrder,
            commerceOrder,
            amount,
            currency: "CLP",
          });
        } else {
          console.warn("[Flow API Response Warning]:", flowData);
          // If credentials need sandbox or live environment switch, provide clear feedback
          return res.json({
            success: false,
            error: flowData.message || "Error al generar la orden en Flow.",
            raw: flowData,
            testUrl: `/checkout?session_id=${commerceOrder}&plan=${planId}&memorial=${memorialId || ""}&amount=${amount}&currency=CLP&flow_fallback=true`,
          });
        }
      } catch (fetchErr: any) {
        console.error("[Flow Network Error]:", fetchErr?.message);
        return res.status(500).json({
          success: false,
          error: "No se pudo contactar los servidores de Flow.",
          details: fetchErr?.message,
        });
      }
    } catch (err: any) {
      console.error("Error in /api/payments/flow/create-order:", err);
      res.status(500).json({ success: false, error: "Error interno del servidor de pagos." });
    }
  });

  // Flow Server Confirmation Webhook — the ONLY writer of a confirmed plan.
  // Uses the service role key (bypasses RLS) since this is the one place
  // account_entitlements is allowed to be written from outside Postgres
  // itself. The client (AppContext's Flow-return handler) never writes here
  // anymore — it only polls and reflects what this webhook already wrote.
  app.post("/api/payments/flow/confirmation", async (req, res) => {
    try {
      const token = req.body.token || req.query.token;
      if (!token) {
        return res.status(400).send("Token required");
      }

      const params = {
        apiKey: FLOW_API_KEY,
        token: String(token),
      };
      const s = signFlowParams(params, FLOW_SECRET_KEY);

      const statusRes = await fetch(`${FLOW_BASE_URL}/payment/getStatus?apiKey=${FLOW_API_KEY}&token=${token}&s=${s}`);
      const statusData = await statusRes.json();

      console.log("[Flow Webhook Confirmation Received]:", statusData);
      // Status 2 = Pagada exitosamente
      if (statusData.status === 2) {
        console.log(`✅ Flow Order ${statusData.flowOrder} confirmed for ${statusData.payer}`);

        let optionalData: any = {};
        try {
          optionalData = statusData.optional
            ? typeof statusData.optional === "string"
              ? JSON.parse(statusData.optional)
              : statusData.optional
            : {};
        } catch {
          optionalData = {};
        }

        const planDisplayNames: Record<string, string> = {
          esencial: "MEMORA Esencial",
          familia: "MEMORA Familia",
          legado: "MEMORA Legado",
          para_siempre: "MEMORA Familia",
          acompanado: "MEMORA Legado",
        };
        const normalizePlan = (p: string): "esencial" | "familia" | "legado" => {
          if (p === "para_siempre" || p === "familia") return "familia";
          if (p === "acompanado" || p === "legado") return "legado";
          return "esencial";
        };

        const orderKey = String(statusData.flowOrder || statusData.commerceOrder || "");
        const normalizedPlan = normalizePlan(optionalData.planId || "esencial");
        const amount = Number(statusData.amount) || 0;

        if (!orderKey) {
          console.error("[Flow Webhook] No flowOrder/commerceOrder on a status=2 payment — cannot persist safely.");
          return res.status(500).send("Missing order identifier");
        }
        if (!supabaseAdmin) {
          console.error("[Flow Webhook] Supabase not configured — cannot persist plan activation.");
          return res.status(500).send("Database not configured");
        }

        // Resolve the paying user. Checkout always requires a logged-in
        // session, so this should normally succeed — but money already
        // changed hands, so a miss is logged loudly for manual reconciliation
        // rather than silently dropped.
        let userId: string | null = null;
        if (optionalData.userEmail) {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("email", optionalData.userEmail)
            .maybeSingle();
          userId = profile?.id || null;
        }
        if (!userId) {
          console.error(`[Flow Webhook] Could not resolve a user for order ${orderKey} (email: ${optionalData.userEmail || "n/a"}) — needs manual reconciliation.`);
        }

        // Idempotency lives in Postgres (flow_order UNIQUE), not in-memory —
        // survives Railway restarts and concurrent webhook retries correctly.
        const { data: inserted, error: insertErr } = await supabaseAdmin
          .from("payment_transactions")
          .insert({
            user_id: userId,
            memorial_id: optionalData.memorialId || null,
            memorial_name: optionalData.memorialName || null,
            plan_id: normalizedPlan,
            amount,
            currency: "CLP",
            status: "completed",
            provider: "flow_webpay",
            invoice_number: orderKey,
            flow_order: orderKey,
          })
          .select("id")
          .maybeSingle();

        if (insertErr && insertErr.code !== "23505") {
          // 23505 = unique_violation (duplicate webhook delivery) — expected, not an error.
          console.error("[Flow Webhook] Failed to record transaction:", insertErr.message);
          return res.status(500).send("Failed to record transaction");
        }

        if (inserted) {
          // First time we've seen this order — this is the authoritative write.
          if (userId) {
            const { error: entError } = await supabaseAdmin
              .from("account_entitlements")
              .update({
                current_plan: normalizedPlan,
                subscription_status: "active",
                subscription_start_date: new Date().toISOString(),
                next_renewal_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                price_clp: amount,
              })
              .eq("user_id", userId);
            if (entError) console.error("[Flow Webhook] Failed to update account_entitlements:", entError.message);
          }

          if (optionalData.memorialId && userId) {
            const { error: memError } = await supabaseAdmin
              .from("memorials")
              .update({ plan_id: normalizedPlan })
              .eq("id", optionalData.memorialId)
              .eq("owner_id", userId);
            if (memError) console.error("[Flow Webhook] Failed to update memorial plan_id:", memError.message);
          }

          sendReceiptEmail({
            userEmail: optionalData.userEmail || statusData.payer,
            userName: optionalData.userName,
            planName: planDisplayNames[optionalData.planId] || "MEMORA",
            amountCLP: statusData.amount,
            invoiceNumber: orderKey,
            paymentMethod: "Flow (Webpay)",
          }).catch((e) => console.error("[Receipt Email] Failed from Flow webhook:", e));
        } else {
          console.log(`[Flow Webhook] Duplicate delivery for order ${orderKey} — already processed, skipping.`);
        }
      }

      res.status(200).send("OK");
    } catch (err: any) {
      console.error("Error handling Flow confirmation webhook:", err);
      res.status(500).send("Webhook Error");
    }
  });

  // Flow User Return Redirect
  const handleFlowReturn = async (req: express.Request, res: express.Response) => {
    try {
      const token = req.body?.token || req.query?.token;
      if (!token) {
        return res.redirect("/?payment_status=cancelled");
      }

      const params = {
        apiKey: FLOW_API_KEY,
        token: String(token),
      };
      const s = signFlowParams(params, FLOW_SECRET_KEY);

      const statusRes = await fetch(`${FLOW_BASE_URL}/payment/getStatus?apiKey=${FLOW_API_KEY}&token=${token}&s=${s}`);
      const statusData = await statusRes.json();

      console.log("[Flow Return Handled]:", statusData);

      let optionalData: any = {};
      try {
        if (statusData.optional) {
          optionalData = typeof statusData.optional === "string" ? JSON.parse(statusData.optional) : statusData.optional;
        }
      } catch (e) {
        optionalData = {};
      }

      const planId = optionalData.planId || "para_siempre";
      const memorialId = optionalData.memorialId || "";
      const isSuccess = statusData.status === 2;

      const redirectUrl = `/?payment_success=${isSuccess}&plan=${planId}&memorial=${memorialId}&flow_token=${token}&flow_order=${statusData.flowOrder || ""}&amount=${statusData.amount || 49000}&commerce_order=${statusData.commerceOrder || ""}`;
      
      res.redirect(redirectUrl);
    } catch (err: any) {
      console.error("Error handling Flow return redirect:", err);
      res.redirect("/?payment_status=error");
    }
  };

  app.get("/api/payments/flow/return", handleFlowReturn);
  app.post("/api/payments/flow/return", handleFlowReturn);

  // Check status by token endpoint
  app.get("/api/payments/flow/status/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const params = {
        apiKey: FLOW_API_KEY,
        token,
      };
      const s = signFlowParams(params, FLOW_SECRET_KEY);

      const statusRes = await fetch(`${FLOW_BASE_URL}/payment/getStatus?apiKey=${FLOW_API_KEY}&token=${token}&s=${s}`);
      const statusData = await statusRes.json();

      res.json({ success: true, data: statusData });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // PAYPAL PAYMENT GATEWAY (International)
  // ==========================================

  app.get("/api/payments/paypal/config", (_req, res) => {
    res.json({
      configured: !!PAYPAL_CLIENT_ID && !!PAYPAL_CLIENT_SECRET,
      clientId: PAYPAL_CLIENT_ID, // meant to be public, same as any PayPal JS SDK integration
      environment: PAYPAL_ENV,
      currency: "USD",
      prices: PAYPAL_PLAN_PRICES_USD,
    });
  });

  // Creates a PayPal order AND a matching "pending" row in payment_transactions
  // (keyed by a short reference id passed to PayPal as invoice_id). Capture
  // looks that row up instead of round-tripping plan/user/memorial data through
  // PayPal's own fields, which have tight length limits.
  app.post("/api/payments/paypal/create-order", async (req, res) => {
    try {
      const { planId, memorialId, userEmail, userName } = req.body;
      const normalizedPlan = planId === "para_siempre" ? "familia" : planId === "acompanado" ? "legado" : (planId || "esencial");
      const amount = PAYPAL_PLAN_PRICES_USD[normalizedPlan];
      if (!amount) {
        return res.status(400).json({ success: false, error: `Plan desconocido: ${planId}` });
      }
      if (!supabaseAdmin) {
        return res.status(500).json({ success: false, error: "Base de datos no configurada." });
      }

      const referenceId = `PP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      let userId: string | null = null;
      if (userEmail) {
        const { data: profile } = await supabaseAdmin.from("profiles").select("id").eq("email", userEmail).maybeSingle();
        userId = profile?.id || null;
      }

      const { error: insertErr } = await supabaseAdmin.from("payment_transactions").insert({
        user_id: userId,
        memorial_id: memorialId || null,
        plan_id: normalizedPlan,
        amount: Math.round(parseFloat(amount) * 100), // USD stored in cents (CLP rows store whole pesos — see currency column)
        currency: "USD",
        status: "pending",
        provider: "paypal",
        invoice_number: referenceId,
      });
      if (insertErr) throw insertErr;

      const accessToken = await getPayPalAccessToken();
      const orderRes = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              invoice_id: referenceId,
              amount: { currency_code: "USD", value: amount },
              description: `MEMORA ${normalizedPlan} (${userName || "Cliente"})`,
            },
          ],
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.id) {
        console.error("[PayPal] create-order failed:", orderData);
        return res.status(500).json({ success: false, error: "No se pudo crear la orden en PayPal." });
      }

      res.json({ success: true, orderId: orderData.id });
    } catch (err: any) {
      console.error("Error in /api/payments/paypal/create-order:", err?.message || err);
      res.status(500).json({ success: false, error: "Error interno del servidor de pagos.", detail: err?.message });
    }
  });

  // Captures the payment server-side and verifies PayPal's own response before
  // granting anything — the single authoritative writer, same role the Flow
  // webhook plays. Idempotent via the pending->completed status transition:
  // a retry (e.g. a double-click) that finds the row already "completed"
  // updates zero rows and is treated as a no-op duplicate, not a re-grant.
  app.post("/api/payments/paypal/capture-order", async (req, res) => {
    try {
      const { orderId } = req.body;
      if (!orderId) return res.status(400).json({ success: false, error: "orderId requerido." });
      if (!supabaseAdmin) return res.status(500).json({ success: false, error: "Base de datos no configurada." });

      const accessToken = await getPayPalAccessToken();
      const captureRes = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      });
      const captureData = await captureRes.json();

      const purchaseUnit = captureData?.purchase_units?.[0];
      const capture = purchaseUnit?.payments?.captures?.[0];
      const isCompleted = captureRes.ok && capture?.status === "COMPLETED";
      const referenceId = purchaseUnit?.invoice_id || captureData?.purchase_units?.[0]?.reference_id;

      if (!isCompleted || !referenceId) {
        console.error("[PayPal] capture failed or incomplete:", JSON.stringify(captureData));
        return res.status(402).json({ success: false, error: "El pago no pudo ser capturado." });
      }

      const { data: transitioned, error: updateErr } = await supabaseAdmin
        .from("payment_transactions")
        .update({ status: "completed" })
        .eq("invoice_number", referenceId)
        .eq("status", "pending")
        .select("*")
        .maybeSingle();
      if (updateErr) throw updateErr;

      if (transitioned) {
        if (transitioned.user_id) {
          await supabaseAdmin
            .from("account_entitlements")
            .update({
              current_plan: transitioned.plan_id,
              subscription_status: "active",
              subscription_start_date: new Date().toISOString(),
              next_renewal_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              // account_entitlements.price_clp is display-only and always in CLP;
              // approximate the USD amount so the profile's renewal reminder
              // doesn't show a raw USD-cents number formatted as pesos.
              price_clp: Math.round((transitioned.amount / 100) * 950),
            })
            .eq("user_id", transitioned.user_id);

          if (transitioned.memorial_id) {
            await supabaseAdmin
              .from("memorials")
              .update({ plan_id: transitioned.plan_id })
              .eq("id", transitioned.memorial_id)
              .eq("owner_id", transitioned.user_id);
          }
        }

        const payerEmail = captureData?.payer?.email_address;
        const payerName = [captureData?.payer?.name?.given_name, captureData?.payer?.name?.surname].filter(Boolean).join(" ");
        sendReceiptEmail({
          userEmail: payerEmail || "",
          userName: payerName || undefined,
          planName: `MEMORA ${transitioned.plan_id}`,
          amountCLP: transitioned.amount / 100, // this row's amount is stored in USD cents
          currency: "USD",
          invoiceNumber: referenceId,
          paymentMethod: "PayPal",
        }).catch((e) => console.error("[Receipt Email] Failed from PayPal capture:", e));
      } else {
        console.log(`[PayPal] Duplicate capture call for ${referenceId} — already processed, skipping.`);
      }

      res.json({ success: true, planId: transitioned?.plan_id });
    } catch (err: any) {
      console.error("Error in /api/payments/paypal/capture-order:", err);
      res.status(500).json({ success: false, error: "Error al procesar la captura del pago." });
    }
  });

  // ==========================================
  // MERCADO PAGO PAYMENT GATEWAY (Chile + Latam)
  // ==========================================

  app.get("/api/payments/mercadopago/config", (_req, res) => {
    res.json({
      configured: !!MERCADOPAGO_ACCESS_TOKEN,
      currency: "CLP",
      prices: MERCADOPAGO_PLAN_PRICES_CLP,
    });
  });

  // Creates a Mercado Pago "preference" (Checkout Pro, redirect-based — same
  // shape as the Flow flow) AND a matching "pending" row in payment_transactions
  // keyed by external_reference, so the webhook can look it up without trusting
  // anything from the client.
  app.post("/api/payments/mercadopago/create-preference", async (req, res) => {
    try {
      const { planId, memorialId, userEmail, userName } = req.body;
      const normalizedPlan = planId === "para_siempre" ? "familia" : planId === "acompanado" ? "legado" : (planId || "esencial");
      const amount = MERCADOPAGO_PLAN_PRICES_CLP[normalizedPlan];
      if (!amount) {
        return res.status(400).json({ success: false, error: `Plan desconocido: ${planId}` });
      }
      if (!supabaseAdmin) {
        return res.status(500).json({ success: false, error: "Base de datos no configurada." });
      }
      if (!MERCADOPAGO_ACCESS_TOKEN) {
        return res.status(500).json({ success: false, error: "Mercado Pago no está configurado." });
      }

      const referenceId = `MP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      let userId: string | null = null;
      if (userEmail) {
        const { data: profile } = await supabaseAdmin.from("profiles").select("id").eq("email", userEmail).maybeSingle();
        userId = profile?.id || null;
      }

      const { error: insertErr } = await supabaseAdmin.from("payment_transactions").insert({
        user_id: userId,
        memorial_id: memorialId || null,
        plan_id: normalizedPlan,
        amount,
        currency: "CLP",
        status: "pending",
        provider: "mercadopago",
        invoice_number: referenceId,
      });
      if (insertErr) throw insertErr;

      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const origin = process.env.APP_URL || `${protocol}://${host}`;

      const planTitles: Record<string, string> = {
        esencial: "MEMORA Esencial",
        familia: "MEMORA Familia",
        legado: "MEMORA Legado",
      };

      // auto_return requires back_urls.success to be a publicly reachable
      // https URL — Mercado Pago rejects the whole preference otherwise, which
      // matters locally (http://localhost) but not in production (Railway/https).
      const isPubliclyReachable = origin.startsWith("https://");

      const prefRes = await fetch(`${MERCADOPAGO_BASE_URL}/checkout/preferences`, {
        method: "POST",
        headers: { Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              title: planTitles[normalizedPlan] || "MEMORA",
              quantity: 1,
              unit_price: amount,
              currency_id: "CLP",
            },
          ],
          payer: { email: userEmail || undefined, name: userName || undefined },
          external_reference: referenceId,
          back_urls: {
            success: `${origin}/api/payments/mercadopago/return`,
            failure: `${origin}/api/payments/mercadopago/return`,
            pending: `${origin}/api/payments/mercadopago/return`,
          },
          ...(isPubliclyReachable ? { auto_return: "approved" } : {}),
          notification_url: isPubliclyReachable ? `${origin}/api/payments/mercadopago/webhook` : undefined,
        }),
      });
      const prefData = await prefRes.json();

      if (!prefRes.ok || !prefData.id) {
        console.error("[Mercado Pago] create-preference failed:", prefData);
        return res.status(500).json({ success: false, error: "No se pudo crear la preferencia de pago en Mercado Pago." });
      }

      res.json({
        success: true,
        redirectUrl: MERCADOPAGO_ENV === "production" ? prefData.init_point : prefData.sandbox_init_point || prefData.init_point,
      });
    } catch (err: any) {
      console.error("Error in /api/payments/mercadopago/create-preference:", err);
      res.status(500).json({ success: false, error: "Error interno del servidor de pagos." });
    }
  });

  // Mercado Pago Webhook — the authoritative writer, same role as the Flow
  // confirmation webhook and PayPal's capture-order. Idempotent via the
  // pending->completed status transition on payment_transactions.
  app.post("/api/payments/mercadopago/webhook", async (req, res) => {
    try {
      const topic = String(req.query.topic || req.query.type || req.body?.type || "");
      const paymentId = String(req.query.id || req.body?.data?.id || "");

      if (topic !== "payment" || !paymentId) {
        // Mercado Pago also notifies about merchant_order and other topics we
        // don't care about — ack with 200 so it doesn't retry forever.
        return res.status(200).send("OK");
      }
      if (!supabaseAdmin || !MERCADOPAGO_ACCESS_TOKEN) {
        return res.status(500).send("Not configured");
      }

      const paymentRes = await fetch(`${MERCADOPAGO_BASE_URL}/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}` },
      });
      const payment = await paymentRes.json();

      if (!paymentRes.ok) {
        console.error("[Mercado Pago Webhook] Failed to fetch payment:", payment);
        return res.status(500).send("Failed to fetch payment");
      }

      console.log("[Mercado Pago Webhook Received]:", { id: paymentId, status: payment.status, external_reference: payment.external_reference });

      if (payment.status !== "approved") {
        return res.status(200).send("OK");
      }

      const referenceId = payment.external_reference;
      if (!referenceId) {
        console.error("[Mercado Pago Webhook] Approved payment with no external_reference — cannot persist safely.");
        return res.status(200).send("OK");
      }

      const { data: transitioned, error: updateErr } = await supabaseAdmin
        .from("payment_transactions")
        .update({ status: "completed" })
        .eq("invoice_number", referenceId)
        .eq("status", "pending")
        .select("*")
        .maybeSingle();
      if (updateErr) throw updateErr;

      if (transitioned) {
        if (transitioned.user_id) {
          await supabaseAdmin
            .from("account_entitlements")
            .update({
              current_plan: transitioned.plan_id,
              subscription_status: "active",
              subscription_start_date: new Date().toISOString(),
              next_renewal_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              price_clp: transitioned.amount,
            })
            .eq("user_id", transitioned.user_id);

          if (transitioned.memorial_id) {
            await supabaseAdmin
              .from("memorials")
              .update({ plan_id: transitioned.plan_id })
              .eq("id", transitioned.memorial_id)
              .eq("owner_id", transitioned.user_id);
          }
        }

        sendReceiptEmail({
          userEmail: payment.payer?.email || "",
          userName: [payment.payer?.first_name, payment.payer?.last_name].filter(Boolean).join(" ") || undefined,
          planName: `MEMORA ${transitioned.plan_id}`,
          amountCLP: transitioned.amount,
          invoiceNumber: referenceId,
          paymentMethod: "Mercado Pago",
        }).catch((e) => console.error("[Receipt Email] Failed from Mercado Pago webhook:", e));
      } else {
        console.log(`[Mercado Pago Webhook] Duplicate delivery for ${referenceId} — already processed, skipping.`);
      }

      res.status(200).send("OK");
    } catch (err: any) {
      console.error("Error handling Mercado Pago webhook:", err);
      res.status(500).send("Webhook Error");
    }
  });

  // Mercado Pago User Return Redirect — the browser lands here after checkout;
  // this only redirects with a payment id for the client to verify server-side,
  // it never grants anything itself (the webhook above is the sole writer).
  const handleMercadoPagoReturn = (req: express.Request, res: express.Response) => {
    const status = String(req.query.collection_status || req.query.status || "");
    const paymentId = String(req.query.payment_id || req.query["collection_id"] || "");
    const isSuccess = status === "approved";
    res.redirect(`/?payment_success=${isSuccess}&mp_payment_id=${paymentId}&provider=mercadopago`);
  };
  app.get("/api/payments/mercadopago/return", handleMercadoPagoReturn);
  app.post("/api/payments/mercadopago/return", handleMercadoPagoReturn);

  // Lets the client verify a payment's real status server-side instead of
  // trusting the redirect URL — mirrors /api/payments/flow/status/:token.
  app.get("/api/payments/mercadopago/status/:paymentId", async (req, res) => {
    try {
      if (!MERCADOPAGO_ACCESS_TOKEN) {
        return res.status(500).json({ success: false, error: "Mercado Pago no está configurado." });
      }
      const paymentRes = await fetch(`${MERCADOPAGO_BASE_URL}/v1/payments/${req.params.paymentId}`, {
        headers: { Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}` },
      });
      const data = await paymentRes.json();
      if (!paymentRes.ok) {
        return res.status(500).json({ success: false, error: "No se pudo verificar el pago." });
      }
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Plan Limits & Quota Verification Backend Endpoint
  app.post("/api/plans/validate-limits", (req, res) => {
    try {
      const { planTier, currentMemorasCount, totalPhotosCount, totalVideosCount, action, incomingCount } = req.body;
      
      const PLAN_LIMITS: Record<string, { maxMemoras: number; maxPhotos: number; maxVideos: number; name: string }> = {
        esencial: { maxMemoras: 1, maxPhotos: 10, maxVideos: 3, name: "MEMORA Esencial" },
        familia: { maxMemoras: 3, maxPhotos: 100, maxVideos: 10, name: "MEMORA Familia" },
        legado: { maxMemoras: 10, maxPhotos: 1000, maxVideos: 50, name: "MEMORA Legado" },
        para_siempre: { maxMemoras: 3, maxPhotos: 100, maxVideos: 10, name: "MEMORA Familia" },
        acompanado: { maxMemoras: 10, maxPhotos: 1000, maxVideos: 50, name: "MEMORA Legado" },
      };

      const normalized = String(planTier || "esencial").toLowerCase();
      const limits = PLAN_LIMITS[normalized] || PLAN_LIMITS.esencial;
      const count = Number(incomingCount) || 1;

      if (action === "create_memora") {
        const canCreate = Number(currentMemorasCount || 0) + count <= limits.maxMemoras;
        return res.json({
          allowed: canCreate,
          current: Number(currentMemorasCount || 0),
          max: limits.maxMemoras,
          remaining: Math.max(0, limits.maxMemoras - Number(currentMemorasCount || 0)),
          planName: limits.name,
          error: canCreate ? null : `Límite de MEMORAs alcanzado para el plan ${limits.name}. Máximo ${limits.maxMemoras}.`,
        });
      }

      if (action === "upload_photo") {
        const canUpload = Number(totalPhotosCount || 0) + count <= limits.maxPhotos;
        return res.json({
          allowed: canUpload,
          current: Number(totalPhotosCount || 0),
          max: limits.maxPhotos,
          remaining: Math.max(0, limits.maxPhotos - Number(totalPhotosCount || 0)),
          planName: limits.name,
          error: canUpload ? null : `Límite global de fotos alcanzado en tu bolsa compartida (${limits.maxPhotos} fotos en ${limits.name}).`,
        });
      }

      if (action === "upload_video") {
        const canUpload = Number(totalVideosCount || 0) + count <= limits.maxVideos;
        return res.json({
          allowed: canUpload,
          current: Number(totalVideosCount || 0),
          max: limits.maxVideos,
          remaining: Math.max(0, limits.maxVideos - Number(totalVideosCount || 0)),
          planName: limits.name,
          error: canUpload ? null : `Límite global de videos alcanzado en tu bolsa compartida (${limits.maxVideos} videos en ${limits.name}).`,
        });
      }

      return res.json({
        success: true,
        limits,
        usage: {
          memoras: { current: Number(currentMemorasCount || 0), max: limits.maxMemoras },
          photos: { current: Number(totalPhotosCount || 0), max: limits.maxPhotos },
          videos: { current: Number(totalVideosCount || 0), max: limits.maxVideos },
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: "Error validating limits", details: err?.message });
    }
  });

  // Payment Receipt Email (Resend) — used by the client-side simulated card
  // flow, where there's no server webhook to trigger it from.
  app.post("/api/payments/send-receipt", async (req, res) => {
    const { userEmail, userName, planName, amountCLP, invoiceNumber, paymentMethod } = req.body;
    const result = await sendReceiptEmail({ userEmail, userName, planName, amountCLP, invoiceNumber, paymentMethod });
    res.status(result.success ? 200 : 400).json(result);
  });

  // Simulated Payment Checkout / Webhook Integration (Fallback)
  app.post("/api/payments/create-checkout-session", (req, res) => {
    const { planId, memorialId, userEmail, billingInterval } = req.body;

    const planPrices: Record<string, number> = {
      esencial: 0,
      para_siempre: 49,
      acompanado: 149,
    };

    const price = planPrices[planId] ?? 49;
    const sessionId = `cs_test_memora_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    res.json({
      success: true,
      sessionId,
      url: `/checkout?session_id=${sessionId}&plan=${planId}&memorial=${memorialId || ""}&amount=${price}`,
      provider: "stripe_test_mode",
      amount: price,
      currency: "USD",
      customerEmail: userEmail,
    });
  });

  app.post("/api/payments/verify-status", (req, res) => {
    const { sessionId, planId } = req.body;
    res.json({
      success: true,
      status: "completed",
      invoiceId: `INV-MEM-${Math.floor(100000 + Math.random() * 900000)}`,
      paidAt: new Date().toISOString(),
      planId: planId || "para_siempre",
      message: "Pago verificado exitosamente mediante webhook seguro.",
    });
  });

  // Contact form — the form previously only showed a fake "sent" toast with
  // no actual delivery anywhere. Sends to contacto@memora.lat via Resend
  // (same service already used for payment receipts), with reply-to set to
  // the submitter so replying in the inbox goes straight back to them.
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, topic, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: "Nombre, correo y mensaje son requeridos." });
      }
      if (!resend) {
        console.warn("[Contact Form] Resend no configurado — no se pudo enviar el mensaje de", email);
        return res.status(500).json({ success: false, error: "Servicio de correo no configurado." });
      }

      const topicLabels: Record<string, string> = {
        editorial: "Ayuda con la redacción de la biografía",
        billing: "Consultas sobre planes y facturación",
        general: "Otra consulta o sugerencia",
      };

      const { error } = await resend.emails.send({
        from: RECEIPT_FROM_EMAIL,
        to: "contacto@memora.lat",
        replyTo: email,
        subject: `[Contacto MEMORA] ${topicLabels[topic] || topic || "Consulta"} — ${name}`,
        html: `
          <div style="font-family:Arial,sans-serif;font-size:14px;color:#24201D;line-height:1.6;">
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Correo:</strong> ${email}</p>
            <p><strong>Tema:</strong> ${topicLabels[topic] || topic || "Consulta"}</p>
            <p><strong>Mensaje:</strong></p>
            <p style="white-space:pre-line;background:#FAF7F2;padding:16px;border-radius:12px;">${message}</p>
          </div>`,
      });

      if (error) {
        console.error("[Contact Form] Resend error:", error);
        return res.status(500).json({ success: false, error: error.message });
      }

      res.json({ success: true });
    } catch (err: any) {
      console.error("[Contact Form] Failed:", err);
      res.status(500).json({ success: false, error: "Error al enviar el mensaje." });
    }
  });

  // SEO landing page targeting "código QR para lápida/memorial" searches —
  // a static, JS-free HTML response (not the SPA) so search engines index
  // the real content immediately without needing to execute React. Every
  // claim here matches an actually-shipped feature (QR code generation,
  // included free on every plan, printable, privacy controls) — nothing
  // here should ever say something the product doesn't really do.
  app.get("/codigo-qr-memorial", (_req, res) => {
    res.header("Content-Type", "text/html; charset=utf-8");
    res.send(`<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Código QR para Memorial Digital y Lápida | MEMORA Chile</title>
<meta name="description" content="Crea un código QR permanente para lápidas, nichos y recordatorios funerarios en Chile. Al escanearlo, familiares y amigos acceden al memorial digital: fotos, videos, biografía y homenajes. Incluido gratis en todos los planes de MEMORA." />
<link rel="canonical" href="https://memora.lat/codigo-qr-memorial" />
<meta property="og:title" content="Código QR para Memorial Digital y Lápida | MEMORA" />
<meta property="og:description" content="Un código QR que lleva directo al memorial digital de tu ser querido. Incluido gratis en todos los planes." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://memora.lat/codigo-qr-memorial" />
<meta property="og:image" content="https://memora.lat/logo-principal.png" />
<link rel="icon" type="image/png" href="/favicon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #FAF7F2; color: #2C2723; line-height: 1.6; }
  h1, h2 { font-family: 'Cormorant Garamond', serif; font-weight: 500; color: #24201D; }
  .wrap { max-width: 780px; margin: 0 auto; padding: 0 24px; }
  header { padding: 24px 0; }
  header a { text-decoration: none; color: #24201D; font-weight: 700; font-size: 20px; letter-spacing: 0.02em; }
  .hero { padding: 40px 0 24px; border-bottom: 1px solid #EAE3D9; }
  .eyebrow { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #7A4E38; background: #F4EFEA; border: 1px solid #D8CEBE; border-radius: 999px; padding: 6px 14px; margin-bottom: 16px; }
  h1 { font-size: 2.4rem; line-height: 1.2; margin-bottom: 16px; }
  .lede { font-size: 1.05rem; color: #5C534B; max-width: 60ch; }
  section { padding: 40px 0; border-bottom: 1px solid #EAE3D9; }
  h2 { font-size: 1.6rem; margin-bottom: 16px; }
  ul { padding-left: 20px; color: #3D3530; }
  li { margin-bottom: 10px; }
  .cta { text-align: center; padding: 48px 0; }
  .btn { display: inline-block; background: #24201D; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 600; font-size: 15px; }
  .btn:hover { background: #3D3530; }
  footer { text-align: center; padding: 32px 0; color: #8C827A; font-size: 12px; }
  footer a { color: #7A4E38; }
</style>
</head>
<body>
<header><div class="wrap"><a href="/">MEMORA</a></div></header>

<div class="wrap">
  <div class="hero">
    <span class="eyebrow">Código QR para Memoriales</span>
    <h1>Un código QR que lleva directo a su memoria — para siempre.</h1>
    <p class="lede">En MEMORA, cada memorial genera automáticamente un código QR de alta resolución, listo para imprimir en una placa, recordatorio funerario o libro de firmas. Cualquier persona lo escanea con la cámara de su teléfono y entra directo a las fotos, la biografía y los homenajes — sin instalar ninguna aplicación.</p>
  </div>

  <section>
    <h2>¿Cómo funciona?</h2>
    <ul>
      <li>Al crear el memorial, el código QR se genera automáticamente — no es un paso aparte ni un costo adicional.</li>
      <li>Se puede descargar en alta resolución para grabar en una placa metálica, imprimir en un recordatorio de papel, o pegar en una lápida o nicho.</li>
      <li>Cualquier smartphone (Android o iPhone) lo lee directo desde la cámara, sin apps ni registros.</li>
      <li>El memorial detrás del código se puede seguir editando con el tiempo: nuevas fotos, nuevas historias, nuevos homenajes — el QR nunca cambia.</li>
    </ul>
  </section>

  <section>
    <h2>Incluido en todos los planes, sin costo extra</h2>
    <p>A diferencia de otros servicios donde el código QR es un producto físico aparte que hay que comprar, en MEMORA el código QR digital viene incluido en <strong>todos</strong> los planes — Esencial, Familia y Legado — desde $990 CLP al año.</p>
  </section>

  <section>
    <h2>Privacidad bajo tu control</h2>
    <p>Tú decides quién puede ver el memorial al que apunta el código: público para cualquiera, protegido con contraseña, solo por invitación, u oculto (no aparece en buscadores, solo accesible con el link o el QR).</p>
  </section>

  <div class="cta">
    <a class="btn" href="/">Crear mi memorial en MEMORA</a>
  </div>
</div>

<footer>
  <div class="wrap">© ${new Date().getFullYear()} MEMORA. <a href="/">memora.lat</a></div>
</footer>
</body>
</html>`);
  });

  // Vite middleware for dev / static files for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ MEMORA Platform running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
