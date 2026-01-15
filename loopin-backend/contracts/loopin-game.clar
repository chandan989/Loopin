;; Loopin Game Smart Contract
;; A location-based territory capture game with crypto prizes

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-game-full (err u103))
(define-constant err-insufficient-funds (err u104))
(define-constant err-game-not-active (err u105))
(define-constant err-already-joined (err u106))
(define-constant err-game-not-ended (err u107))
(define-constant err-invalid-rank (err u108))

;; Data Variables
(define-data-var next-game-id uint u0)
(define-data-var platform-fee-percent uint u5) ;; 5% platform fee

;; Game Types and Entry Fees (in microSTX)
(define-constant CASUAL-FEE u0)
(define-constant BLITZ-FEE u1000000) ;; 1 STX
(define-constant ELITE-FEE u10000000) ;; 10 STX

;; Data Maps

;; Game Sessions
(define-map games
    { game-id: uint }
    {
        game-type: (string-ascii 20),
        status: (string-ascii 20), ;; "lobby", "active", "ended"
        max-players: uint,
        entry-fee: uint,
        prize-pool: uint,
        start-block: uint,
        end-block: uint,
        creator: principal
    }
)

;; Game Participants
(define-map game-participants
    { game-id: uint, player: principal }
    {
        joined-block: uint,
        area-captured: uint, ;; in square meters (scaled by 1000 for precision)
        rank: uint,
        prize-won: uint
    }
)

;; Player Stats (all-time)
(define-map player-stats
    { player: principal }
    {
        total-area: uint,
        games-played: uint,
        games-won: uint,
        total-earnings: uint,
        level: uint
    }
)

;; Track players in each game
(define-map game-player-count
    { game-id: uint }
    { count: uint }
)

;; Read-only functions

(define-read-only (get-game (game-id uint))
    (map-get? games { game-id: game-id })
)

(define-read-only (get-participant (game-id uint) (player principal))
    (map-get? game-participants { game-id: game-id, player: player })
)

(define-read-only (get-player-stats (player principal))
    (default-to
        { total-area: u0, games-played: u0, games-won: u0, total-earnings: u0, level: u1 }
        (map-get? player-stats { player: player })
    )
)

(define-read-only (get-player-count (game-id uint))
    (default-to u0 (get count (map-get? game-player-count { game-id: game-id })))
)

(define-read-only (get-next-game-id)
    (var-get next-game-id)
)

;; Private functions

(define-private (get-entry-fee (game-type (string-ascii 20)))
    (if (is-eq game-type "CASUAL")
        CASUAL-FEE
        (if (is-eq game-type "BLITZ")
            BLITZ-FEE
            ELITE-FEE
        )
    )
)

;; Public functions

;; Create a new game
(define-public (create-game (game-type (string-ascii 20)) (max-players uint))
    (let
        (
            (game-id (var-get next-game-id))
            (entry-fee (get-entry-fee game-type))
        )
        (map-set games
            { game-id: game-id }
            {
                game-type: game-type,
                status: "lobby",
                max-players: max-players,
                entry-fee: entry-fee,
                prize-pool: u0,
                start-block: u0,
                end-block: u0,
                creator: tx-sender
            }
        )
        (map-set game-player-count { game-id: game-id } { count: u0 })
        (var-set next-game-id (+ game-id u1))
        (ok game-id)
    )
)

;; Join a game
(define-public (join-game (game-id uint))
    (let
        (
            (game (unwrap! (get-game game-id) err-not-found))
            (player-count (get-player-count game-id))
            (entry-fee (get entry-fee game))
        )
        ;; Check if game is in lobby
        (asserts! (is-eq (get status game) "lobby") err-game-not-active)
        
        ;; Check if game is not full
        (asserts! (< player-count (get max-players game)) err-game-full)
        
        ;; Check if player hasn't already joined
        (asserts! (is-none (get-participant game-id tx-sender)) err-already-joined)
        
        ;; Transfer entry fee if required
        (if (> entry-fee u0)
            (try! (stx-transfer? entry-fee tx-sender (as-contract tx-sender)))
            true
        )
        
        ;; Add player to game
        (map-set game-participants
            { game-id: game-id, player: tx-sender }
            {
                joined-block: block-height,
                area-captured: u0,
                rank: u0,
                prize-won: u0
            }
        )
        
        ;; Update player count
        (map-set game-player-count 
            { game-id: game-id } 
            { count: (+ player-count u1) }
        )
        
        ;; Update prize pool
        (map-set games
            { game-id: game-id }
            (merge game { prize-pool: (+ (get prize-pool game) entry-fee) })
        )
        
        (ok true)
    )
)

;; Start a game (only creator or contract owner)
(define-public (start-game (game-id uint))
    (let
        (
            (game (unwrap! (get-game game-id) err-not-found))
        )
        ;; Only creator or owner can start
        (asserts! (or (is-eq tx-sender (get creator game)) (is-eq tx-sender contract-owner)) err-unauthorized)
        
        ;; Check if game is in lobby
        (asserts! (is-eq (get status game) "lobby") err-game-not-active)
        
        ;; Update game status
        (map-set games
            { game-id: game-id }
            (merge game {
                status: "active",
                start-block: block-height
            })
        )
        
        (ok true)
    )
)

;; End a game and set final rankings (only creator or contract owner)
(define-public (end-game (game-id uint))
    (let
        (
            (game (unwrap! (get-game game-id) err-not-found))
        )
        ;; Only creator or owner can end
        (asserts! (or (is-eq tx-sender (get creator game)) (is-eq tx-sender contract-owner)) err-unauthorized)
        
        ;; Check if game is active
        (asserts! (is-eq (get status game) "active") err-game-not-active)
        
        ;; Update game status
        (map-set games
            { game-id: game-id }
            (merge game {
                status: "ended",
                end-block: block-height
            })
        )
        
        (ok true)
    )
)

;; Submit player results (called by backend after game ends)
(define-public (submit-player-result (game-id uint) (player principal) (area-captured uint) (rank uint))
    (let
        (
            (game (unwrap! (get-game game-id) err-not-found))
            (participant (unwrap! (get-participant game-id player) err-not-found))
        )
        ;; Only contract owner can submit results
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        
        ;; Check if game has ended
        (asserts! (is-eq (get status game) "ended") err-game-not-ended)
        
        ;; Update participant data
        (map-set game-participants
            { game-id: game-id, player: player }
            (merge participant {
                area-captured: area-captured,
                rank: rank
            })
        )
        
        ;; Update player stats
        (let
            (
                (stats (get-player-stats player))
            )
            (map-set player-stats
                { player: player }
                {
                    total-area: (+ (get total-area stats) area-captured),
                    games-played: (+ (get games-played stats) u1),
                    games-won: (if (is-eq rank u1) (+ (get games-won stats) u1) (get games-won stats)),
                    total-earnings: (get total-earnings stats),
                    level: (get level stats)
                }
            )
        )
        
        (ok true)
    )
)

;; Distribute prizes (called after all results are submitted)
(define-public (distribute-prize (game-id uint) (player principal) (prize-amount uint))
    (let
        (
            (game (unwrap! (get-game game-id) err-not-found))
            (participant (unwrap! (get-participant game-id player) err-not-found))
        )
        ;; Only contract owner can distribute
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        
        ;; Check if game has ended
        (asserts! (is-eq (get status game) "ended") err-game-not-ended)
        
        ;; Check if prize amount is valid
        (asserts! (<= prize-amount (get prize-pool game)) err-insufficient-funds)
        
        ;; Calculate platform fee
        (let
            (
                (platform-fee (/ (* prize-amount (var-get platform-fee-percent)) u100))
                (player-prize (- prize-amount platform-fee))
            )
            ;; Transfer prize to player
            (try! (as-contract (stx-transfer? player-prize tx-sender player)))
            
            ;; Update participant prize
            (map-set game-participants
                { game-id: game-id, player: player }
                (merge participant { prize-won: player-prize })
            )
            
            ;; Update player total earnings
            (let
                (
                    (stats (get-player-stats player))
                )
                (map-set player-stats
                    { player: player }
                    (merge stats { total-earnings: (+ (get total-earnings stats) player-prize) })
                )
            )
            
            (ok player-prize)
        )
    )
)

;; Admin function to update platform fee
(define-public (set-platform-fee (new-fee uint))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (asserts! (<= new-fee u20) (err u109)) ;; Max 20% fee
        (var-set platform-fee-percent new-fee)
        (ok true)
    )
)

;; Emergency withdraw (only owner)
(define-public (emergency-withdraw (amount uint) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (as-contract (stx-transfer? amount tx-sender recipient))
    )
)
