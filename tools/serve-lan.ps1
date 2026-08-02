<#
    serve-lan.ps1 — development helper, not part of the website.

    Serves the Latent Ocean folder over your local network so you can open it
    on a phone or tablet that is on the same Wi-Fi.

    Run it from an ADMINISTRATOR PowerShell window. Binding to all network
    interfaces (rather than just localhost) requires elevation on Windows.

        Right-click PowerShell -> "Run as administrator", then:
        cd "C:\Users\Jesui\OneDrive - NJIT\Documents\Adobe Animate\VAE_Tutorial\latent-ocean"
        .\tools\serve-lan.ps1

    Press Ctrl+C to stop. Delete this file any time; the site does not use it.
#>

param(
    [int]$Port = 8791,
    [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Stop"

# Warn early rather than failing with an opaque "Access is denied" later.
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Warning "Not running as administrator. Binding to the network will likely fail."
    Write-Warning "Close this and reopen PowerShell with 'Run as administrator'."
}

$mime = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".md"   = "text/plain; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$Port/")

try {
    $listener.Start()
} catch {
    Write-Error "Could not start on port $Port. Run as administrator, or try another -Port."
    exit 1
}

$rootFull = [System.IO.Path]::GetFullPath($Root)

# Show every address a phone might use, so you can try another if one is blocked.
$addresses = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254*" }

Write-Host ""
Write-Host "Serving: $rootFull" -ForegroundColor Cyan
Write-Host "On this PC:  http://localhost:$Port/" -ForegroundColor Green
foreach ($a in $addresses) {
    Write-Host ("On " + $a.InterfaceAlias + ":  http://" + $a.IPAddress + ":$Port/") -ForegroundColor Green
}
Write-Host ""
Write-Host "Phone must be on the same Wi-Fi. Press Ctrl+C to stop." -ForegroundColor Yellow
Write-Host ""

try {
    while ($listener.IsListening) {
        $context  = $listener.GetContext()
        $request  = $context.Request
        $response = $context.Response

        try {
            $path = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
            if ($path -eq "/") { $path = "/index.html" }

            $filePath = [System.IO.Path]::GetFullPath((Join-Path $rootFull $path.TrimStart("/")))

            # Refuse anything that resolves outside the served folder.
            if (-not $filePath.StartsWith($rootFull)) {
                $response.StatusCode = 403
                continue
            }

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $type = $mime[$ext]
                if (-not $type) { $type = "application/octet-stream" }

                $response.ContentType = $type
                $response.Headers.Add("Cache-Control", "no-cache, no-store")

                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                Write-Host ("200  " + $path) -ForegroundColor DarkGray
            } else {
                $response.StatusCode = 404
                Write-Host ("404  " + $path) -ForegroundColor Red
            }
        } catch {
            $response.StatusCode = 500
        } finally {
            $response.Close()
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
    Write-Host "Server stopped." -ForegroundColor Yellow
}
