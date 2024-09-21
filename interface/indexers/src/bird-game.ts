import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  BirdMinted,
  GamePlayed,
  LevelUp,
  PlayerRegistered,
  Transfer
} from "../generated/BirdGame/BirdGame"
import { BirdMintedEvent, GamePlayedEvent, LevelUpEvent, PlayerRegisteredEvent, Bird, Game, Player, GameHistory } from "../generated/schema"
import { BirdGame } from "../generated/BirdGame/BirdGame"

export function handleBirdMinted(event: BirdMinted): void {
  let entity = new BirdMintedEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  entity.owner = event.params.owner
  entity.tokenId = event.params.tokenId
  entity.imageId = event.params.imageId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let bird = new Bird(event.params.tokenId.toString())
  let player = Player.load(event.params.owner.toHexString())
  
  if (player === null) {
    player = new Player(event.params.owner.toHexString())
    player.name = "Unknown"
    player.highScore = BigInt.fromI32(0)
    player.xp = BigInt.fromI32(0)
    player.level = BigInt.fromI32(1)
    player.balance = BigInt.fromI32(0)
    player.tokenOfOwnerByIndex = []
  }
  
  let contract = BirdGame.bind(event.address)
  player.balance = contract.balanceOf(event.params.owner)
  
  // Add new token to tokenOfOwnerByIndex
  let tokenOfOwnerByIndex = player.tokenOfOwnerByIndex
  tokenOfOwnerByIndex.push(event.params.tokenId)
  player.tokenOfOwnerByIndex = tokenOfOwnerByIndex

  player.save()
  
  bird.owner = player.id
  bird.highScore = BigInt.fromI32(0)
  bird.xp = BigInt.fromI32(0)
  bird.level = BigInt.fromI32(1)
  bird.imageId = event.params.imageId
  bird.ownerIndex = player.balance.minus(BigInt.fromI32(1))
  bird.save()
}

export function handleTransfer(event: Transfer): void {
  let fromPlayer = Player.load(event.params.from.toHexString())
  let toPlayer = Player.load(event.params.to.toHexString())
  let contract = BirdGame.bind(event.address)

  if (fromPlayer) {
    fromPlayer.balance = contract.balanceOf(event.params.from)
    
    // Remove transferred token from fromPlayer's tokenOfOwnerByIndex
    let fromTokens = fromPlayer.tokenOfOwnerByIndex
    let index = fromTokens.indexOf(event.params.tokenId)
    if (index > -1) {
      fromTokens.splice(index, 1)
    }
    fromPlayer.tokenOfOwnerByIndex = fromTokens

    fromPlayer.save()

    // Update indices for remaining birds of fromPlayer
    for (let i = 0; i < fromPlayer.balance.toI32(); i++) {
      let tokenId = contract.tokenOfOwnerByIndex(event.params.from, BigInt.fromI32(i))
      let bird = Bird.load(tokenId.toString())
      if (bird) {
        bird.ownerIndex = BigInt.fromI32(i)
        bird.save()
      }
    }
  }

  if (toPlayer === null) {
    toPlayer = new Player(event.params.to.toHexString())
    toPlayer.name = "Unknown"
    toPlayer.highScore = BigInt.fromI32(0)
    toPlayer.xp = BigInt.fromI32(0)
    toPlayer.level = BigInt.fromI32(1)
    toPlayer.balance = BigInt.fromI32(0)
    toPlayer.tokenOfOwnerByIndex = []
  }

  toPlayer.balance = contract.balanceOf(event.params.to)
  
  // Add transferred token to toPlayer's tokenOfOwnerByIndex
  let toTokens = toPlayer.tokenOfOwnerByIndex
  toTokens.push(event.params.tokenId)
  toPlayer.tokenOfOwnerByIndex = toTokens

  toPlayer.save()

  let bird = Bird.load(event.params.tokenId.toString())
  if (bird) {
    bird.owner = toPlayer.id
    bird.ownerIndex = toPlayer.balance.minus(BigInt.fromI32(1))
    bird.save()
  }
}

export function handleGamePlayed(event: GamePlayed): void {
  let entity = new GamePlayedEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  entity.birdId = event.params.birdId
  entity.gameId = event.params.gameId
  entity.score = event.params.score
  entity.xpEarned = event.params.xpEarned

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let gameHistory = new GameHistory(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  let bird = Bird.load(event.params.birdId.toString())
  let game = Game.load(event.params.gameId.toString())
  
  if (bird === null || game === null) return
  
  let player = Player.load(bird.owner)
  if (player === null) return
  
  gameHistory.bird = bird.id
  gameHistory.game = game.id
  gameHistory.player = player.id
  gameHistory.score = event.params.score
  gameHistory.xpEarned = event.params.xpEarned
  gameHistory.timestamp = event.block.timestamp
  gameHistory.save()
  
  bird.highScore = bird.highScore.gt(event.params.score) ? bird.highScore : event.params.score
  bird.xp = bird.xp.plus(event.params.xpEarned)
  bird.save()
  
  player.highScore = player.highScore.gt(event.params.score) ? player.highScore : event.params.score
  player.xp = player.xp.plus(event.params.xpEarned)
  player.save()
}

export function handleLevelUp(event: LevelUp): void {
  let entity = new LevelUpEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  entity.birdId = event.params.birdId
  entity.newLevel = event.params.newLevel

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let bird = Bird.load(event.params.birdId.toString())
  if (bird === null) return
  
  bird.level = event.params.newLevel
  bird.save()
  
  let player = Player.load(bird.owner)
  if (player === null) return
  
  player.level = event.params.newLevel
  player.save()
}

export function handlePlayerRegistered(event: PlayerRegistered): void {
  let entity = new PlayerRegisteredEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  entity.playerAddress = event.params.playerAddress
  entity.name = event.params.name

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let player = new Player(event.params.playerAddress.toHexString())
  player.name = event.params.name
  player.highScore = BigInt.fromI32(0)
  player.xp = BigInt.fromI32(0)
  player.level = BigInt.fromI32(1)
  player.balance = BigInt.fromI32(0)
  player.tokenOfOwnerByIndex = [] 
  player.save()
}