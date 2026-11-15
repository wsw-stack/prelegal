# Build the Prelegal image and run it at http://localhost:8000.
Set-Location (Join-Path $PSScriptRoot "..")

$Image = "prelegal"
$Container = "prelegal"

docker rm -f $Container 2>$null | Out-Null

docker build -t $Image .
if ($LASTEXITCODE -ne 0) { throw "docker build failed" }

$EnvArgs = @()
if (Test-Path ".env") { $EnvArgs = @("--env-file", ".env") }
docker run -d --name $Container -p 8000:8000 @EnvArgs $Image | Out-Null
if ($LASTEXITCODE -ne 0) { throw "docker run failed" }

Write-Host "Prelegal is running at http://localhost:8000"
