// Cache en memoria del servidor para el estado de needs-setup.
// Una vez que el backend confirma que NO necesita setup (needs_setup: false),
// cacheamos ese resultado permanentemente (hasta reinicio del server).
// Si needs_setup es true, no cacheamos para permitir re-verificación.

let cachedResult: boolean | null = null;

export function getSetupCache(): boolean | null {
  return cachedResult;
}

export function setSetupCache(needsSetup: boolean): void {
  // Solo cacheamos cuando NO necesita setup (estado permanente)
  if (!needsSetup) {
    cachedResult = false;
  }
}

export function invalidateSetupCache(): void {
  cachedResult = null;
}
