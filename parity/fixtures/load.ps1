# Loads or removes a fixture file in the disposable test database.
#   powershell -File parity/fixtures/load.ps1 auth.sql
#   powershell -File parity/fixtures/load.ps1 auth-cleanup.sql
#
# Like reseed.ps1 it only touches a database whose name ends in _test, inside the test container.

param(
    [Parameter(Mandatory = $true)][string]$File,
    [string]$Container = 'cooplubbers_mysql',
    [string]$Database = 'cooplubbers_test',
    [string]$Password = 'password'   # root password of the test container (docker-compose.yml)
)

$ErrorActionPreference = 'Stop'
if ($Database -notmatch '_test$') { throw "Refusing to touch '$Database': the name must end in _test" }

$engine = Get-Command podman, docker -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Source
if (-not $engine) {
    $fallback = Join-Path $env:LOCALAPPDATA 'Programs\Podman\podman.exe'
    if (Test-Path $fallback) { $engine = $fallback } else { throw 'Neither podman nor docker was found' }
}

$path = if (Test-Path $File) { $File } else { Join-Path $PSScriptRoot $File }
if (-not (Test-Path $path)) { throw "Fixture not found: $File" }

# mysql warns about the password on the command line (stderr); show everything else, in particular real errors
$ErrorActionPreference = 'Continue'
$output = Get-Content -Raw -Encoding UTF8 $path | & $engine exec -i $Container mysql -uroot "-p$Password" $Database 2>&1
$output | ForEach-Object { "$_" } | Where-Object { $_ -notmatch 'Using a password' -and $_.Trim() -ne '' }
if ($LASTEXITCODE -ne 0) { throw "Loading $path failed (exit code $LASTEXITCODE)" }
Write-Host "Loaded $path into $Database"
