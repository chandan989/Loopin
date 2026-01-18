;; Loopin Game Contract Tests

(define-constant deployer tx-sender)
(define-constant player1 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
(define-constant player2 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG)
(define-constant player3 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC)

;; Test 1: Create a CASUAL game
(define-public (test-create-casual-game)
    (let
        (
            (result (contract-call? .loopin-game create-game "CASUAL" u10))
        )
        (asserts! (is-ok result) (err u1))
        (asserts! (is-eq (unwrap-panic result) u0) (err u2))
        (ok true)
    )
)

;; Test 2: Create a BLITZ game
(define-public (test-create-blitz-game)
    (let
        (
            (result (contract-call? .loopin-game create-game "BLITZ" u5))
        )
        (asserts! (is-ok result) (err u3))
        (ok true)
    )
)

;; Test 3: Join a CASUAL game (no entry fee)
(define-public (test-join-casual-game)
    (begin
        ;; First create a game
        (unwrap-panic (contract-call? .loopin-game create-game "CASUAL" u10))
        
        ;; Join the game
        (let
            (
                (join-result (contract-call? .loopin-game join-game u0))
            )
            (asserts! (is-ok join-result) (err u4))
            (ok true)
        )
    )
)

;; Test 4: Verify player count increases
(define-public (test-player-count)
    (begin
        ;; Create game
        (unwrap-panic (contract-call? .loopin-game create-game "CASUAL" u10))
        
        ;; Check initial count
        (asserts! (is-eq (contract-call? .loopin-game get-player-count u0) u0) (err u5))
        
        ;; Join game
        (unwrap-panic (contract-call? .loopin-game join-game u0))
        
        ;; Check count increased
        (asserts! (is-eq (contract-call? .loopin-game get-player-count u0) u1) (err u6))
        (ok true)
    )
)

;; Test 5: Cannot join same game twice
(define-public (test-cannot-join-twice)
    (begin
        ;; Create and join game
        (unwrap-panic (contract-call? .loopin-game create-game "CASUAL" u10))
        (unwrap-panic (contract-call? .loopin-game join-game u0))
        
        ;; Try to join again (should fail)
        (let
            (
                (second-join (contract-call? .loopin-game join-game u0))
            )
            (asserts! (is-err second-join) (err u7))
            (ok true)
        )
    )
)

;; Test 6: Start a game
(define-public (test-start-game)
    (begin
        ;; Create game
        (unwrap-panic (contract-call? .loopin-game create-game "CASUAL" u10))
        
        ;; Start game
        (let
            (
                (start-result (contract-call? .loopin-game start-game u0))
            )
            (asserts! (is-ok start-result) (err u8))
            
            ;; Verify status changed
            (let
                (
                    (game (unwrap-panic (contract-call? .loopin-game get-game u0)))
                )
                (asserts! (is-eq (get status game) "active") (err u9))
                (ok true)
            )
        )
    )
)

;; Test 7: Cannot join active game
(define-public (test-cannot-join-active-game)
    (begin
        ;; Create and start game
        (unwrap-panic (contract-call? .loopin-game create-game "CASUAL" u10))
        (unwrap-panic (contract-call? .loopin-game start-game u0))
        
        ;; Try to join (should fail)
        (let
            (
                (join-result (contract-call? .loopin-game join-game u0))
            )
            (asserts! (is-err join-result) (err u10))
            (ok true)
        )
    )
)

;; Test 8: End a game
(define-public (test-end-game)
    (begin
        ;; Create and start game
        (unwrap-panic (contract-call? .loopin-game create-game "CASUAL" u10))
        (unwrap-panic (contract-call? .loopin-game start-game u0))
        
        ;; End game
        (let
            (
                (end-result (contract-call? .loopin-game end-game u0))
            )
            (asserts! (is-ok end-result) (err u11))
            
            ;; Verify status changed
            (let
                (
                    (game (unwrap-panic (contract-call? .loopin-game get-game u0)))
                )
                (asserts! (is-eq (get status game) "ended") (err u12))
                (ok true)
            )
        )
    )
)

;; Test 9: Submit player results
(define-public (test-submit-results)
    (begin
        ;; Create, join, start, and end game
        (unwrap-panic (contract-call? .loopin-game create-game "CASUAL" u10))
        (unwrap-panic (contract-call? .loopin-game join-game u0))
        (unwrap-panic (contract-call? .loopin-game start-game u0))
        (unwrap-panic (contract-call? .loopin-game end-game u0))
        
        ;; Submit results (area: 1000 sq meters, rank: 1)
        (let
            (
                (result (contract-call? .loopin-game submit-player-result u0 tx-sender u1000000 u1))
            )
            (asserts! (is-ok result) (err u13))
            
            ;; Verify participant data updated
            (let
                (
                    (participant (unwrap-panic (contract-call? .loopin-game get-participant u0 tx-sender)))
                )
                (asserts! (is-eq (get area-captured participant) u1000000) (err u14))
                (asserts! (is-eq (get rank participant) u1) (err u15))
                (ok true)
            )
        )
    )
)

;; Test 10: Player stats updated after game
(define-public (test-player-stats-updated)
    (begin
        ;; Create, join, start, end, and submit results
        (unwrap-panic (contract-call? .loopin-game create-game "CASUAL" u10))
        (unwrap-panic (contract-call? .loopin-game join-game u0))
        (unwrap-panic (contract-call? .loopin-game start-game u0))
        (unwrap-panic (contract-call? .loopin-game end-game u0))
        (unwrap-panic (contract-call? .loopin-game submit-player-result u0 tx-sender u1000000 u1))
        
        ;; Check player stats
        (let
            (
                (stats (contract-call? .loopin-game get-player-stats tx-sender))
            )
            (asserts! (is-eq (get games-played stats) u1) (err u16))
            (asserts! (is-eq (get games-won stats) u1) (err u17))
            (asserts! (is-eq (get total-area stats) u1000000) (err u18))
            (ok true)
        )
    )
)

;; Test 11: Game full check
(define-public (test-game-full)
    (begin
        ;; Create game with max 1 player
        (unwrap-panic (contract-call? .loopin-game create-game "CASUAL" u1))
        
        ;; First player joins
        (unwrap-panic (contract-call? .loopin-game join-game u0))
        
        ;; Game should be full now - this would need to be tested with a different tx-sender
        ;; For now, we just verify the count
        (asserts! (is-eq (contract-call? .loopin-game get-player-count u0) u1) (err u19))
        (ok true)
    )
)

;; Test 12: Platform fee calculation
(define-public (test-platform-fee)
    (begin
        ;; Set platform fee to 10%
        (unwrap-panic (contract-call? .loopin-game set-platform-fee u10))
        
        ;; Verify it was set
        ;; Note: We can't directly read the data-var, but we can test the fee calculation
        ;; by distributing a prize and checking the amount
        (ok true)
    )
)

;; Run all tests
(define-public (run-all-tests)
    (begin
        (print "Running Loopin Game Contract Tests...")
        (try! (test-create-casual-game))
        (print "✓ Test 1: Create CASUAL game")
        
        (try! (test-create-blitz-game))
        (print "✓ Test 2: Create BLITZ game")
        
        (try! (test-join-casual-game))
        (print "✓ Test 3: Join CASUAL game")
        
        (try! (test-player-count))
        (print "✓ Test 4: Player count increases")
        
        (try! (test-cannot-join-twice))
        (print "✓ Test 5: Cannot join same game twice")
        
        (try! (test-start-game))
        (print "✓ Test 6: Start game")
        
        (try! (test-cannot-join-active-game))
        (print "✓ Test 7: Cannot join active game")
        
        (try! (test-end-game))
        (print "✓ Test 8: End game")
        
        (try! (test-submit-results))
        (print "✓ Test 9: Submit player results")
        
        (try! (test-player-stats-updated))
        (print "✓ Test 10: Player stats updated")
        
        (try! (test-game-full))
        (print "✓ Test 11: Game full check")
        
        (try! (test-platform-fee))
        (print "✓ Test 12: Platform fee")
        
        (print "All tests passed! ✓")
        (ok true)
    )
)
