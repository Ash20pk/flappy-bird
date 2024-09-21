import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Approval,
  ApprovalForAll,
  BatchMetadataUpdate,
  BirdMinted,
  CoordinatorSet,
  GamePlayed,
  GameSetupGenerated,
  LevelUp,
  MetadataUpdate,
  OwnershipTransferRequested,
  OwnershipTransferred,
  PlayerRegistered,
  Transfer
} from "../generated/BirdGame/BirdGame"

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return approvalEvent
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createBatchMetadataUpdateEvent(
  _fromTokenId: BigInt,
  _toTokenId: BigInt
): BatchMetadataUpdate {
  let batchMetadataUpdateEvent = changetype<BatchMetadataUpdate>(newMockEvent())

  batchMetadataUpdateEvent.parameters = new Array()

  batchMetadataUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "_fromTokenId",
      ethereum.Value.fromUnsignedBigInt(_fromTokenId)
    )
  )
  batchMetadataUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "_toTokenId",
      ethereum.Value.fromUnsignedBigInt(_toTokenId)
    )
  )

  return batchMetadataUpdateEvent
}

export function createBirdMintedEvent(
  owner: Address,
  tokenId: BigInt,
  imageId: BigInt
): BirdMinted {
  let birdMintedEvent = changetype<BirdMinted>(newMockEvent())

  birdMintedEvent.parameters = new Array()

  birdMintedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  birdMintedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  birdMintedEvent.parameters.push(
    new ethereum.EventParam(
      "imageId",
      ethereum.Value.fromUnsignedBigInt(imageId)
    )
  )

  return birdMintedEvent
}

export function createCoordinatorSetEvent(
  vrfCoordinator: Address
): CoordinatorSet {
  let coordinatorSetEvent = changetype<CoordinatorSet>(newMockEvent())

  coordinatorSetEvent.parameters = new Array()

  coordinatorSetEvent.parameters.push(
    new ethereum.EventParam(
      "vrfCoordinator",
      ethereum.Value.fromAddress(vrfCoordinator)
    )
  )

  return coordinatorSetEvent
}

export function createGamePlayedEvent(
  birdId: BigInt,
  gameId: BigInt,
  score: BigInt,
  xpEarned: BigInt
): GamePlayed {
  let gamePlayedEvent = changetype<GamePlayed>(newMockEvent())

  gamePlayedEvent.parameters = new Array()

  gamePlayedEvent.parameters.push(
    new ethereum.EventParam("birdId", ethereum.Value.fromUnsignedBigInt(birdId))
  )
  gamePlayedEvent.parameters.push(
    new ethereum.EventParam("gameId", ethereum.Value.fromUnsignedBigInt(gameId))
  )
  gamePlayedEvent.parameters.push(
    new ethereum.EventParam("score", ethereum.Value.fromUnsignedBigInt(score))
  )
  gamePlayedEvent.parameters.push(
    new ethereum.EventParam(
      "xpEarned",
      ethereum.Value.fromUnsignedBigInt(xpEarned)
    )
  )

  return gamePlayedEvent
}

export function createGameSetupGeneratedEvent(
  tokenId: BigInt,
  gameSetupSeed: BigInt
): GameSetupGenerated {
  let gameSetupGeneratedEvent = changetype<GameSetupGenerated>(newMockEvent())

  gameSetupGeneratedEvent.parameters = new Array()

  gameSetupGeneratedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  gameSetupGeneratedEvent.parameters.push(
    new ethereum.EventParam(
      "gameSetupSeed",
      ethereum.Value.fromUnsignedBigInt(gameSetupSeed)
    )
  )

  return gameSetupGeneratedEvent
}

export function createLevelUpEvent(birdId: BigInt, newLevel: BigInt): LevelUp {
  let levelUpEvent = changetype<LevelUp>(newMockEvent())

  levelUpEvent.parameters = new Array()

  levelUpEvent.parameters.push(
    new ethereum.EventParam("birdId", ethereum.Value.fromUnsignedBigInt(birdId))
  )
  levelUpEvent.parameters.push(
    new ethereum.EventParam(
      "newLevel",
      ethereum.Value.fromUnsignedBigInt(newLevel)
    )
  )

  return levelUpEvent
}

export function createMetadataUpdateEvent(_tokenId: BigInt): MetadataUpdate {
  let metadataUpdateEvent = changetype<MetadataUpdate>(newMockEvent())

  metadataUpdateEvent.parameters = new Array()

  metadataUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "_tokenId",
      ethereum.Value.fromUnsignedBigInt(_tokenId)
    )
  )

  return metadataUpdateEvent
}

export function createOwnershipTransferRequestedEvent(
  from: Address,
  to: Address
): OwnershipTransferRequested {
  let ownershipTransferRequestedEvent = changetype<OwnershipTransferRequested>(
    newMockEvent()
  )

  ownershipTransferRequestedEvent.parameters = new Array()

  ownershipTransferRequestedEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  ownershipTransferRequestedEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )

  return ownershipTransferRequestedEvent
}

export function createOwnershipTransferredEvent(
  from: Address,
  to: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )

  return ownershipTransferredEvent
}

export function createPlayerRegisteredEvent(
  playerAddress: Address,
  name: string
): PlayerRegistered {
  let playerRegisteredEvent = changetype<PlayerRegistered>(newMockEvent())

  playerRegisteredEvent.parameters = new Array()

  playerRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "playerAddress",
      ethereum.Value.fromAddress(playerAddress)
    )
  )
  playerRegisteredEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )

  return playerRegisteredEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}
