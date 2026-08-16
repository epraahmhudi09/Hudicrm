// "Biometric unlock" for this app is a local device gate, not a login
// method: Firebase Auth already keeps the user signed in across app
// restarts (persisted session), so this just uses the OS's platform
// authenticator (Face ID / Touch ID / Windows Hello / Android fingerprint)
// to prove the same authorized person is holding the device before
// revealing that already-authenticated session — the credential is
// registered and verified entirely client-side via the browser's WebAuthn
// API, never sent anywhere. It doesn't replace the password (which is
// still required once per device, to enable it), it just avoids retyping
// it every time the app is reopened.

function storageKey(uid: string): string {
  return `hudicrm_biometric_credential_${uid}`;
}

// Cast to BufferSource: TS's lib.dom types crypto.getRandomValues's return
// as Uint8Array<ArrayBufferLike> (permits SharedArrayBuffer), which isn't
// assignable to BufferSource (Uint8Array<ArrayBuffer> only) — the value
// itself is always backed by a plain ArrayBuffer here, so this is safe.
function randomChallenge(): BufferSource {
  return crypto.getRandomValues(new Uint8Array(32)) as BufferSource;
}

function base64urlEncode(buf: ArrayBuffer): string {
  let str = "";
  for (const b of new Uint8Array(buf)) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(value: string): BufferSource {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes as BufferSource;
}

export async function isBiometricSupported(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function isBiometricEnabled(uid: string): boolean {
  return Boolean(localStorage.getItem(storageKey(uid)));
}

export async function registerBiometric(
  uid: string,
  email: string,
  displayName: string
): Promise<void> {
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: randomChallenge(),
      rp: { name: "Hudi CRM", id: window.location.hostname },
      user: {
        id: new TextEncoder().encode(uid),
        name: email,
        displayName: displayName || email,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
      timeout: 60000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error("Biometric setup was cancelled.");
  localStorage.setItem(storageKey(uid), base64urlEncode(credential.rawId));
}

export async function verifyBiometric(uid: string): Promise<boolean> {
  const storedId = localStorage.getItem(storageKey(uid));
  if (!storedId) return false;
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: randomChallenge(),
        allowCredentials: [{ id: base64urlDecode(storedId), type: "public-key" }],
        userVerification: "required",
        timeout: 60000,
      },
    });
    return Boolean(assertion);
  } catch {
    return false;
  }
}

export function disableBiometric(uid: string): void {
  localStorage.removeItem(storageKey(uid));
}
