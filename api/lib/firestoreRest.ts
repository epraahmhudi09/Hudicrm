import { getAccessToken, getServiceAccount } from "./googleAuth";

type FirestoreValue = Record<string, unknown>;

function base(): string {
  return `https://firestore.googleapis.com/v1/projects/${getServiceAccount().project_id}/databases/(default)/documents`;
}

async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken(["https://www.googleapis.com/auth/datastore"]);
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Firestore REST ${res.status}: ${await res.text()}`);
  }
  return res;
}

function encodeValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === "object") {
    const fields: Record<string, FirestoreValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) fields[k] = encodeValue(v);
    return { mapValue: { fields } };
  }
  throw new Error(`Cannot encode value of type ${typeof value}`);
}

function decodeValue(value: Record<string, unknown>): unknown {
  if (value == null) return null;
  if ("nullValue" in value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return new Date(value.timestampValue as string);
  if ("mapValue" in value) {
    const mapValue = value.mapValue as { fields?: Record<string, FirestoreValue> };
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(mapValue.fields ?? {})) obj[k] = decodeValue(v);
    return obj;
  }
  return null;
}

export interface FirestoreDoc {
  id: string;
  [key: string]: unknown;
}

function decodeDocument(doc: { name: string; fields?: Record<string, FirestoreValue> }): FirestoreDoc {
  const id = doc.name.split("/").pop()!;
  const data: FirestoreDoc = { id };
  for (const [k, v] of Object.entries(doc.fields ?? {})) data[k] = decodeValue(v);
  return data;
}

function encodeFields(data: Record<string, unknown>): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(data)) fields[k] = encodeValue(v);
  return fields;
}

/** Lists every document in a top-level collection (paginated automatically). */
export async function listCollection(collectionPath: string): Promise<FirestoreDoc[]> {
  const results: FirestoreDoc[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(`${base()}/${collectionPath}`);
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await authFetch(url.toString());
    const json = (await res.json()) as {
      documents?: Array<{ name: string; fields?: Record<string, FirestoreValue> }>;
      nextPageToken?: string;
    };
    for (const doc of json.documents ?? []) results.push(decodeDocument(doc));
    pageToken = json.nextPageToken;
  } while (pageToken);

  return results;
}

/** Runs a structured query with a single field filter against a collection. */
export async function queryLessThanOrEqual(
  collectionId: string,
  fieldPath: string,
  value: Date
): Promise<FirestoreDoc[]> {
  const res = await authFetch(`${base()}:runQuery`, {
    method: "POST",
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }],
        where: {
          fieldFilter: {
            field: { fieldPath },
            op: "LESS_THAN_OR_EQUAL",
            value: encodeValue(value),
          },
        },
      },
    }),
  });

  const json = (await res.json()) as Array<{
    document?: { name: string; fields?: Record<string, FirestoreValue> };
  }>;
  return json.filter((r) => r.document).map((r) => decodeDocument(r.document!));
}

/** Full overwrite of a document (creates it if it doesn't exist). */
export async function setDocument(path: string, data: Record<string, unknown>): Promise<void> {
  await authFetch(`${base()}/${path}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: encodeFields(data) }),
  });
}

/** Merges only the given fields into an existing document. */
export async function updateFields(path: string, data: Record<string, unknown>): Promise<void> {
  const url = new URL(`${base()}/${path}`);
  for (const key of Object.keys(data)) url.searchParams.append("updateMask.fieldPaths", key);

  await authFetch(url.toString(), {
    method: "PATCH",
    body: JSON.stringify({ fields: encodeFields(data) }),
  });
}
