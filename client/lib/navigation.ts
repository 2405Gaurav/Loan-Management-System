// Central route constants to avoid magic strings across the app
export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  eligibilityCheck: "/eligibility-check",
} as const;

export const ELIGIBILITY_REDIRECT_PARAM = "redirect";

// Build login URL with return path after authentication
export function getLoginUrl(redirectTo: string = ROUTES.eligibilityCheck): string {
  return `${ROUTES.login}?${ELIGIBILITY_REDIRECT_PARAM}=${encodeURIComponent(redirectTo)}`;
}

// Build signup URL with return path after registration
export function getSignupUrl(redirectTo: string = ROUTES.eligibilityCheck): string {
  return `${ROUTES.signup}?${ELIGIBILITY_REDIRECT_PARAM}=${encodeURIComponent(redirectTo)}`;
}

// Read safe redirect target from query string (defaults to eligibility page)
export function getRedirectTarget(searchParams: URLSearchParams): string {
  const redirect = searchParams.get(ELIGIBILITY_REDIRECT_PARAM);
  if (!redirect || !redirect.startsWith("/")) {
    return ROUTES.eligibilityCheck;
  }
  return redirect;
}
