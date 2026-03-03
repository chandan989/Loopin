;; ------------------------------------------
;; RENDEZVOUS PROPERTIES AND INVARIANTS
;; ------------------------------------------

;; Property: create-game should only return an OK response and effectively create the game
(define-public (test-create-game (game-type (string-ascii 20)) (max-players uint))
    (let (
            (game-id (var-get next-game-id))
            (res (create-game game-type max-players))
        )
        (asserts! (is-ok res) (err u1))
        (asserts! (is-some (get-game game-id)) (err u2))
        (ok true)
    )
)

;; Property: set-platform-fee properly enforces upper limit of 20 and onlyOwner
(define-public (test-set-platform-fee (new-fee uint))
    (let (
            (res (set-platform-fee new-fee))
        )
        (if (is-eq tx-sender contract-owner)
            (if (<= new-fee u20)
                (asserts! (is-ok res) (err u11))
                (asserts! (is-eq res (err u109)) (err u12))
            )
            (asserts! (is-eq res err-owner-only) (err u13))
        )
        (ok true)
    )
)

;; Property: set-game-oracle enforces onlyOwner
(define-public (test-set-game-oracle (new-oracle principal))
    (let (
            (res (set-game-oracle new-oracle))
        )
        (if (is-eq tx-sender contract-owner)
            (asserts! (is-ok res) (err u21))
            (asserts! (is-eq res err-owner-only) (err u22))
        )
        (ok true)
    )
)

;; Property: join-game logic checking
(define-public (test-join-game (game-id uint))
    (let (
            (game-opt (get-game game-id))
            (participant-opt-before (get-participant game-id tx-sender))
            (player-count-before (get-player-count game-id))
            (res (join-game game-id))
        )
        (if (is-none game-opt)
            ;; If game doesn't exist, should return err-not-found
            (asserts! (is-eq res err-not-found) (err u31))
            (let (
                    (game (unwrap-panic game-opt))
                 )
                 ;; Check conditions for failure
                 (if (not (is-eq (get status game) "lobby"))
                     (asserts! (is-eq res err-game-not-active) (err u32))
                     (if (>= player-count-before (get max-players game))
                         (asserts! (is-eq res err-game-full) (err u33))
                         (if (is-some participant-opt-before)
                             (asserts! (is-eq res err-already-joined) (err u34))
                             ;; Cannot easily assert ok because tx-sender might not have enough STX to pay the entry fee
                             true
                         )
                     )
                 )
            )
        )
        (ok true)
    )
)

;; Property: start-game enforces role and state
(define-public (test-start-game (game-id uint))
    (let (
            (game-opt (get-game game-id))
            (res (start-game game-id))
        )
        (if (is-none game-opt)
            (asserts! (is-eq res err-not-found) (err u41))
            (let ((game (unwrap-panic game-opt)))
                (if (and (not (is-eq tx-sender (get creator game))) (not (is-eq tx-sender contract-owner)))
                    (asserts! (is-eq res err-unauthorized) (err u42))
                    (if (not (is-eq (get status game) "lobby"))
                        (asserts! (is-eq res err-game-not-active) (err u43))
                        (asserts! (is-ok res) (err u44))
                    )
                )
            )
        )
        (ok true)
    )
)

;; Property: end-game enforces role and state
(define-public (test-end-game (game-id uint))
     (let (
            (game-opt (get-game game-id))
            (res (end-game game-id))
        )
        (if (is-none game-opt)
            (asserts! (is-eq res err-not-found) (err u51))
            (let ((game (unwrap-panic game-opt)))
                (if (and (not (is-eq tx-sender (get creator game))) (not (is-eq tx-sender contract-owner)))
                    (asserts! (is-eq res err-unauthorized) (err u52))
                    (if (not (is-eq (get status game) "active"))
                        (asserts! (is-eq res err-game-not-active) (err u53))
                        (asserts! (is-ok res) (err u54))
                    )
                )
            )
        )
        (ok true)
    )
)

;; Property: submit-player-result enforces role and state
(define-public (test-submit-player-result (game-id uint) (player principal) (area-captured uint) (rank uint))
    (let (
            (game-opt (get-game game-id))
            (participant-opt (get-participant game-id player))
            (res (submit-player-result game-id player area-captured rank))
        )
        (if (or (is-none game-opt) (is-none participant-opt))
            (asserts! (is-eq res err-not-found) (err u61))
            (let ((game (unwrap-panic game-opt)))
                (if (and (not (is-eq tx-sender contract-owner)) (not (is-eq tx-sender (var-get game-oracle))))
                    (asserts! (is-eq res err-owner-only) (err u62))
                    (if (not (is-eq (get status game) "ended"))
                        (asserts! (is-eq res err-game-not-ended) (err u63))
                        (asserts! (is-ok res) (err u64))
                    )
                )
            )
        )
        (ok true)
    )
)

;; Property: distribute-prize enforces role, state, and funds
(define-public (test-distribute-prize (game-id uint) (player principal) (prize-amount uint))
    (let (
            (game-opt (get-game game-id))
            (participant-opt (get-participant game-id player))
            (res (distribute-prize game-id player prize-amount))
        )
        (if (or (is-none game-opt) (is-none participant-opt))
            (asserts! (is-eq res err-not-found) (err u71))
            (let ((game (unwrap-panic game-opt)))
                (if (and (not (is-eq tx-sender contract-owner)) (not (is-eq tx-sender (var-get game-oracle))))
                    (asserts! (is-eq res err-owner-only) (err u72))
                    (if (not (is-eq (get status game) "ended"))
                        (asserts! (is-eq res err-game-not-ended) (err u73))
                        (if (> prize-amount (get prize-pool game))
                            (asserts! (is-eq res err-insufficient-funds) (err u74))
                            ;; Contract might not hold the actual STX to fulfill if the total > contract balance, which could revert.
                            true
                        )
                    )
                )
            )
        )
        (ok true)
    )
)

;; Property: emergency-withdraw enforces onlyOwner
(define-public (test-emergency-withdraw (amount uint) (recipient principal))
    (let (
            (res (emergency-withdraw amount recipient))
        )
        (if (not (is-eq tx-sender contract-owner))
            (asserts! (is-eq res err-owner-only) (err u81))
            true
        )
        (ok true)
    )
)


;; ------------------------------------------
;; INVARIANTS
;; ------------------------------------------

(define-public (test-invariant-platform-fee-bound)
    (if (<= (var-get platform-fee-percent) u20)
        (ok true)
        (err u1)
    )
)
