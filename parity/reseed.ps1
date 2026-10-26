# Reloads the disposable test database from the dump. Run it after a parity run that used --include-mutations.
#   powershell -File parity/reseed.ps1
#
# It DROPS and recreates the database cooplubbers_test inside the test container. It refuses to touch any other database.

param(
    [string]$Container = 'cooplubbers_mysql',
    [string]$Database = 'cooplubbers_test',
    [string]$Password = 'password'   # root password of the test container (docker-compose.yml)
)

$ErrorActionPreference = 'Stop'
if ($Database -notmatch '_test$') { throw "Refusing to reseed '$Database': the name must end in _test" }

$engine = Get-Command podman, docker -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Source
if (-not $engine) {
    $fallback = Join-Path $env:LOCALAPPDATA 'Programs\Podman\podman.exe'
    if (Test-Path $fallback) { $engine = $fallback } else { throw 'Neither podman nor docker was found' }
}

$dump = Join-Path $PSScriptRoot '..\Database\Dump20240103 (3).sql'
if (-not (Test-Path $dump)) { throw "Dump not found: $dump" }

Write-Host "Recreating $Database in $Container from the dump (this can take a minute)..."
& $engine exec $Container mysql -uroot "-p$Password" -e "DROP DATABASE IF EXISTS ``$Database``;"
# the dump creates the database and selects it itself
Get-Content -Raw -Encoding UTF8 $dump | & $engine exec -i $Container mysql -uroot "-p$Password"
& $engine exec $Container mysql -uroot "-p$Password" -N -e "SELECT COUNT(*) AS tables_loaded FROM information_schema.tables WHERE table_schema='$Database';"
