
target "dapp" {
}

target "server" {
  tags = ["cartesi/dapp:iot_rollups_dapp-devel-server"]
}

target "console" {
  tags = ["cartesi/dapp:iot_rollups_dapp-devel-console"]
}

target "machine" {
  tags = ["cartesi/dapp:iot_rollups_dapp-devel-machine"]
}
