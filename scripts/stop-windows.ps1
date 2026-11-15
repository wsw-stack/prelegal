# Stop and remove the Prelegal container. Its database goes with it.
$Container = "prelegal"

if (docker ps -aq --filter "name=^$Container$") {
  docker rm -f $Container | Out-Null
  Write-Host "Prelegal stopped"
} else {
  Write-Host "Prelegal was not running"
}
