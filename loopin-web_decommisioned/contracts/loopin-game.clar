;; ===================================================================
;; LOOPIN GAME CONTRACT v1
;; Location-Based Territory Capture Game on Stacks
;; ===================================================================

;; ===================================================================
;; CONSTANTS
;; ===================================================================

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-GAME-NOT-FOUND (err u101))
(define-constant ERR-GAME-FULL (err u102))
(define-constant ERR-INSUFFICIENT-BALANCE (err u103))
(define-constant ERR-GAME-ALREADY-STARTED (err u104))
(define-constant ERR-GAME-NOT-STARTED (err u105))
(define-constant ERR-ALREADY-JOINED (err u106))
(define-constant ERR-GAME-ENDED (err u107))
(define-constant ERR-INVALID-POWERUP (err u108))
(define-constant ERR-TRANSFER-FAILED (err u109))
(define-constant ERR-GAME-NOT-ENDED (err u110))
(define-constant ERR-NO-WINNER (err u111))

;; Contract owner
(define-constant CONTRACT-OWNER tx-sender)

;; Power-up types
(define-constant POWERUP-SHIELD u1)
(define-constant POWERUP-STEALTH u2)

;; Default game settings (in microSTX, 1 STX = 1,000,000 microSTX)
(define-constant DEFAULT-ENTRY-FEE u500000) ;; 0.5 STX
(define-constant DEFAULT-MAX-PLAYERS u10)
(define-constant DEFAULT-GAME-DURATION u3600) ;; 60 minutes in seconds

;; Power-up costs
(define-constant SHIELD-COST u500000) ;; 0.5 STX
(define-constant STEALTH-COST u1000000) ;; 1 STX

;; Platform fee (5% of prize pool)
(define-constant PLATFORM-FEE-PERCENT u5)

;; ===================================================================
;;                          DATA VARIABLES
;; ===================================================================

(define-data-var game-id-nonce uint u0)
(define-data-var platform-revenue uint u0)

;; ===================================================================
;;                          DATA MAPS
;; ===================================================================

;; Game sessions
(define-map games
  { game-id: uint }
  {
    creator: principal,
    entry-fee: uint,
    prize-pool: uint,
    max-players: uint,
    current-players: uint,
    status: (string-ascii 20), ;; "lobby", "active", "ended"
    start-block: uint,
    end-block: uint,
    winner: (optional principal),
    created-at: uint
  }
)

;; Player participation in games
(define-map game-players
  { game-id: uint, player: principal }
  {
    joined-at: uint,
    area-captured: uint,
    territories-count: uint,
    is-active: bool
  }
)

;; Power-up inventory per player per game
(define-map player-powerups
  { game-id: uint, player: principal }
  {
    shields: uint,
    stealth: uint
  }
)

;; ===================================================================
;;                       READ-ONLY FUNCTIONS
;; ===================================================================

;; Get game details
(define-read-only (get-game (game-id uint))
  (map-get? games { game-id: game-id })
)

;; Get player data in a game
(define-read-only (get-player-in-game (game-id uint) (player principal))
  (map-get? game-players { game-id: game-id, player: player })
)

;; Get player power-ups
(define-read-only (get-player-powerups (game-id uint) (player principal))
  (default-to 
    { shields: u0, stealth: u0 }
    (map-get? player-powerups { game-id: game-id, player: player })
  )
)

;; Get current game ID
(define-read-only (get-current-game-id)
  (var-get game-id-nonce)
)

;; Get platform revenue
(define-read-only (get-platform-revenue)
  (var-get platform-revenue)
)

;; Calculate platform fee
(define-read-only (calculate-platform-fee (amount uint))
  (/ (* amount PLATFORM-FEE-PERCENT) u100)
)

;; ===================================================================
;;                       PRIVATE FUNCTIONS
;; ===================================================================

;; Check if player is in game
(define-private (is-player-in-game (game-id uint) (player principal))
  (is-some (map-get? game-players { game-id: game-id, player: player }))
)

;; ===================================================================
;;                       PUBLIC FUNCTIONS
;; ===================================================================

;; -------------------------------------------------------------------
;;  GAME CREATION & MANAGEMENT
;; -------------------------------------------------------------------

;; Create a new game session
(define-public (create-game)
  (let
    (
      (new-game-id (+ (var-get game-id-nonce) u1))
      (current-block stacks-block-height)
    )
    ;; Increment game ID
    (var-set game-id-nonce new-game-id)
    
    ;; Create game
    (map-set games
      { game-id: new-game-id }
      {
        creator: tx-sender,
        entry-fee: DEFAULT-ENTRY-FEE,
        prize-pool: u0,
        max-players: DEFAULT-MAX-PLAYERS,
        current-players: u0,
        status: "lobby",
        start-block: u0,
        end-block: u0,
        winner: none,
        created-at: current-block
      }
    )
    (ok new-game-id)
  )
)

;; Join a game session
(define-public (join-game (game-id uint))
  (let
    (
      (game (unwrap! (map-get? games { game-id: game-id }) ERR-GAME-NOT-FOUND))
      (entry-fee (get entry-fee game))
    )
    ;; Validations
    (asserts! (is-eq (get status game) "lobby") ERR-GAME-ALREADY-STARTED)
    (asserts! (< (get current-players game) (get max-players game)) ERR-GAME-FULL)
    (asserts! (not (is-player-in-game game-id tx-sender)) ERR-ALREADY-JOINED)
    
    ;; Transfer entry fee to contract
    (try! (stx-transfer? entry-fee tx-sender (as-contract tx-sender)))
    
    ;; Add player to game
    (map-set game-players
      { game-id: game-id, player: tx-sender }
      {
        joined-at: stacks-block-height,
        area-captured: u0,
        territories-count: u0,
        is-active: true
      }
    )
    
    ;; Initialize power-ups
    (map-set player-powerups
      { game-id: game-id, player: tx-sender }
      { shields: u0, stealth: u0 }
    )
    
    ;; Update game
    (map-set games
      { game-id: game-id }
      (merge game {
        current-players: (+ (get current-players game) u1),
        prize-pool: (+ (get prize-pool game) entry-fee)
      })
    )
    (ok true)
  )
)

;; Start a game (can be called by creator or any player once min players joined)
(define-public (start-game (game-id uint))
  (let
    (
      (game (unwrap! (map-get? games { game-id: game-id }) ERR-GAME-NOT-FOUND))
      (current-block stacks-block-height)
      (end-block (+ current-block DEFAULT-GAME-DURATION))
    )
    ;; Validations
    (asserts! (is-eq (get status game) "lobby") ERR-GAME-ALREADY-STARTED)
    (asserts! (> (get current-players game) u0) ERR-GAME-NOT-FOUND)
    
    ;; Update game status
    (map-set games
      { game-id: game-id }
      (merge game {
        status: "active",
        start-block: current-block,
        end-block: end-block
      })
    )
    (ok true)
  )
)

;; End game and declare winner
(define-public (end-game (game-id uint) (winner principal))
  (let
    (
      (game (unwrap! (map-get? games { game-id: game-id }) ERR-GAME-NOT-FOUND))
      (player-data (unwrap! (map-get? game-players { game-id: game-id, player: winner }) ERR-NOT-AUTHORIZED))
      (prize-pool (get prize-pool game))
      (platform-fee (calculate-platform-fee prize-pool))
      (winner-prize (- prize-pool platform-fee))
    )
    ;; Validations
    (asserts! (is-eq (get status game) "active") ERR-GAME-NOT-STARTED)
    (asserts! (>= stacks-block-height (get end-block game)) ERR-GAME-NOT-ENDED)
    (asserts! (is-player-in-game game-id winner) ERR-NOT-AUTHORIZED)
    
    ;; Transfer prize to winner
    (try! (as-contract (stx-transfer? winner-prize tx-sender winner)))
    
    ;; Update platform revenue
    (var-set platform-revenue (+ (var-get platform-revenue) platform-fee))
    
    ;; Update game
    (map-set games
      { game-id: game-id }
      (merge game {
        status: "ended",
        winner: (some winner)
      })
    )
    (ok winner-prize)
  )
)

;; -------------------------------------------------------------------
;;  POWER-UP PURCHASES
;; -------------------------------------------------------------------

;; Purchase shield power-up
(define-public (buy-shield (game-id uint))
  (let
    (
      (game (unwrap! (map-get? games { game-id: game-id }) ERR-GAME-NOT-FOUND))
      (powerups (get-player-powerups game-id tx-sender))
    )
    ;; Validations
    (asserts! (is-eq (get status game) "active") ERR-GAME-NOT-STARTED)
    (asserts! (is-player-in-game game-id tx-sender) ERR-NOT-AUTHORIZED)
    
    ;; Transfer payment to contract
    (try! (stx-transfer? SHIELD-COST tx-sender (as-contract tx-sender)))
    
    ;; Update power-ups
    (map-set player-powerups
      { game-id: game-id, player: tx-sender }
      (merge powerups { shields: (+ (get shields powerups) u1) })
    )
    
    ;; Add to platform revenue
    (var-set platform-revenue (+ (var-get platform-revenue) SHIELD-COST))
    
    (ok true)
  )
)

;; Purchase stealth power-up
(define-public (buy-stealth (game-id uint))
  (let
    (
      (game (unwrap! (map-get? games { game-id: game-id }) ERR-GAME-NOT-FOUND))
      (powerups (get-player-powerups game-id tx-sender))
    )
    ;; Validations
    (asserts! (is-eq (get status game) "active") ERR-GAME-NOT-STARTED)
    (asserts! (is-player-in-game game-id tx-sender) ERR-NOT-AUTHORIZED)
    
    ;; Transfer payment to contract
    (try! (stx-transfer? STEALTH-COST tx-sender (as-contract tx-sender)))
    
    ;; Update power-ups
    (map-set player-powerups
      { game-id: game-id, player: tx-sender }
      (merge powerups { stealth: (+ (get stealth powerups) u1) })
    )
    
    ;; Add to platform revenue
    (var-set platform-revenue (+ (var-get platform-revenue) STEALTH-COST))
    
    (ok true)
  )
)

;; Use shield (called by backend when player's trail is attacked)
(define-public (use-shield (game-id uint))
  (let
    (
      (powerups (get-player-powerups game-id tx-sender))
    )
    ;; Validations
    (asserts! (> (get shields powerups) u0) ERR-INVALID-POWERUP)
    
    ;; Decrement shield count
    (map-set player-powerups
      { game-id: game-id, player: tx-sender }
      (merge powerups { shields: (- (get shields powerups) u1) })
    )
    (ok true)
  )
)

;; Use stealth (called by player to activate)
(define-public (use-stealth (game-id uint))
  (let
    (
      (powerups (get-player-powerups game-id tx-sender))
    )
    ;; Validations
    (asserts! (> (get stealth powerups) u0) ERR-INVALID-POWERUP)
    
    ;; Decrement stealth count
    (map-set player-powerups
      { game-id: game-id, player: tx-sender }
      (merge powerups { stealth: (- (get stealth powerups) u1) })
    )
    (ok true)
  )
)

;; -------------------------------------------------------------------
;;  GAME STATE UPDATES (Called by authorized backend)
;; -------------------------------------------------------------------

;; Update player's captured area
(define-public (update-player-area (game-id uint) (player principal) (area uint) (territories uint))
  (let
    (
      (game (unwrap! (map-get? games { game-id: game-id }) ERR-GAME-NOT-FOUND))
      (player-data (unwrap! (map-get? game-players { game-id: game-id, player: player }) ERR-NOT-AUTHORIZED))
    )
    ;; Validation: only during active game
    (asserts! (is-eq (get status game) "active") ERR-GAME-NOT-STARTED)
    
    ;; Update player data
    (map-set game-players
      { game-id: game-id, player: player }
      (merge player-data {
        area-captured: area,
        territories-count: territories
      })
    )
    (ok true)
  )
)

;; -------------------------------------------------------------------
;;  ADMIN FUNCTIONS
;; -------------------------------------------------------------------

;; Withdraw platform revenue (only contract owner)
(define-public (withdraw-platform-revenue (recipient principal))
  (let
    (
      (amount (var-get platform-revenue))
    )
    ;; Only contract owner can withdraw
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INSUFFICIENT-BALANCE)
    
    ;; Transfer revenue
    (try! (as-contract (stx-transfer? amount tx-sender recipient)))
    
    ;; Reset revenue counter
    (var-set platform-revenue u0)
    (ok amount)
  )
)

;; Emergency cancel game (only creator, only if in lobby)
(define-public (cancel-game (game-id uint))
  (let
    (
      (game (unwrap! (map-get? games { game-id: game-id }) ERR-GAME-NOT-FOUND))
    )
    ;; Only creator can cancel
    (asserts! (is-eq tx-sender (get creator game)) ERR-NOT-AUTHORIZED)
    ;; Only in lobby
    (asserts! (is-eq (get status game) "lobby") ERR-GAME-ALREADY-STARTED)
    
    ;; Mark as ended
    (map-set games
      { game-id: game-id }
      (merge game { status: "cancelled" })
    )
    (ok true)
  )
)

