import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define which routes are public (don't require authentication)
const isPublicRoute = createRouteMatcher([
  '/',           // Home page
  '/login(.*)',  // Login page and any sub-routes
  '/signup(.*)', // Signup page and any sub-routes
  '/sso-callback(.*)', // OAuth callback
]);

export default clerkMiddleware( (auth, request) => {
  if (!isPublicRoute(request)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};