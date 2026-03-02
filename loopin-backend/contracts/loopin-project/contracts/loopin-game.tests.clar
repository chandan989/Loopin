;; ------------------------------------------
;; RENDEZVOUS PROPERTIES AND INVARIANTS
;; ------------------------------------------

;; Property 1: create-game should return valid response
(define-public (test-valid-create-game (game-type (string-ascii 20)) (max-players uint))
    (begin
        ;; If max-players is 0 or game-type is empty, it might still create? Let's check.
        ;; Since the contract does not restrict type or max players other than by uint sizes,
        ;; we just verify that it doesn't panic.
        (let ((res (create-game game-type max-players)))
            (asserts! (is-ok res) (err u1))
            (ok true)
        )
    )
)

;; Property 2: set-platform-fee properly enforces upper limit of 20
(define-public (test-platform-fee-enforced (new-fee uint))
    (if (is-eq tx-sender contract-owner)
        (if (<= new-fee u20)
            (begin
                (asserts! (is-ok (set-platform-fee new-fee)) (err u1))
                (asserts! (is-eq (var-get platform-fee-percent) new-fee) (err u2))
                (ok true)
            )
            (begin
                (asserts! (is-err (set-platform-fee new-fee)) (err u3))
                (ok true)
            )
        )
        ;; For non-owners, it must always err with err-owner-only
        (begin
            (asserts! (is-eq (set-platform-fee new-fee) err-owner-only) (err u4))
            (ok true)
        )
    )
)

;; test-invariant: Platform fee should always be <= 20%
(define-public (test-invariant-fee-leq-20)
    (if (<= (var-get platform-fee-percent) u20)
        (ok true)
        (err u1)
    )
)
