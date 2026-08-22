import { NextResponse, type NextRequest } from "next/server";

function withDevicePolicy(response: NextResponse, cameraEnabled: boolean, microphoneEnabled = false) {
  response.headers.set(
    "Permissions-Policy",
    `camera=${cameraEnabled ? "(self)" : "()"}, microphone=${microphoneEnabled ? "(self)" : "()"}, geolocation=(), browsing-topics=()`,
  );
  return response;
}

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host")?.split(":")[0] || request.nextUrl.hostname).toLowerCase();
  const isAvatarHost = host === "avatar.viste.ai";
  const isVoiceHost = host === "voice.viste.ai";
  const isAvatarPath = request.nextUrl.pathname === "/avatar" || request.nextUrl.pathname.startsWith("/avatar/")
    || request.nextUrl.pathname === "/es/avatar" || request.nextUrl.pathname.startsWith("/es/avatar/");
  const isVoicePath = request.nextUrl.pathname === "/voice" || request.nextUrl.pathname.startsWith("/voice/")
    || request.nextUrl.pathname === "/es/voz" || request.nextUrl.pathname.startsWith("/es/voz/");

  if (isAvatarHost && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/avatar";
    return withDevicePolicy(NextResponse.rewrite(url), true);
  }
  if (isAvatarHost && request.nextUrl.pathname === "/es") {
    const url = request.nextUrl.clone();
    url.pathname = "/es/avatar";
    return withDevicePolicy(NextResponse.rewrite(url), true);
  }
  if (isVoiceHost && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/voice";
    return withDevicePolicy(NextResponse.rewrite(url), false, true);
  }
  if (isVoiceHost && request.nextUrl.pathname === "/es") {
    const url = request.nextUrl.clone();
    url.pathname = "/es/voz";
    return withDevicePolicy(NextResponse.rewrite(url), false, true);
  }
  if (host === "studio.viste.ai" && request.nextUrl.pathname === "/") {
    return withDevicePolicy(NextResponse.redirect(new URL("/app", request.url)), false);
  }
  return withDevicePolicy(NextResponse.next(), isAvatarHost || isAvatarPath, isVoiceHost || isVoicePath);
}

export const config = { matcher: "/:path*" };
