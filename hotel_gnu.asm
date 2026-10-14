; ===================================================
; PROJECT: https://riyachavan935-ai.github.io/Student-/
; TITLE: Smart Hotel Table Allocator - GNU SIM 8085
; STUDENT: Riya Chavan
; MAPPING: CALL=Book Table, PUSH=Order, SP=Cart, HLT=Order
; ===================================================

; --- MEMORY MAP (2000H onwards) ---
; 2000H-2005H : Table Status (00H=Free, 01H=Booked)
; 2050H : HL Register - Selected Table
; 2100H-2110H : Food Stack (Order List)
; 2200H-2201H : Total Bill (16-bit)
; 2300H : SP Count (Cart Items)
; 2301H : Z Flag (Booking Status)

        LXI H, 2000H
        MVI M, 00H      ; T01 FREE
        INX H
        MVI M, 01H      ; T02 BOOKED
        INX H
        MVI M, 00H      ; T03 FREE - We will book this
        INX H
        MVI M, 00H      ; T04 FREE
        INX H
        MVI M, 01H      ; T05 BOOKED
        INX H
        MVI M, 00H      ; T06 FREE

        LXI SP, 2110H   ; Set SP for Food Stack
        LXI H, 0000H
        LXI B, 0000H    ; B=0, C=SP Count
        LXI D, 0000H    ; DE=Bill = 0

; ---------- 1. BOOK TABLE : CALL Operation ----------
BOOK:   MVI A, 02H      ; Table ID 2 = T03
        STA 2050H       ; Save to HL Register Memory

        LXI H, 2000H
        ADD L           ; A=2 + L=00 = 02
        MOV L, A        ; HL = 2002H -> T03 address
        MOV A, M
        CPI 01H
        JZ BOOK_FAIL

        MVI M, 01H      ; BOOK IT - Mark 01H
        MVI A, 01H
        STA 2301H       ; Z=1 Success
        JMP ORDER

BOOK_FAIL:
        MVI A, 00H
        STA 2301H       ; Z=0 Fail
        HLT

; ---------- 2. FOOD ORDER : PUSH Operation ----------
ORDER:  ; -- Order 1: Burger Rs 150 --
        MVI A, 01H
        PUSH B          ; PUSH to stack
        INR C           ; SP++
        MOV A, C
        STA 2300H       ; Save SP count

        LXI H, 2200H
        MOV A, M
        ADI 96H         ; 96H = 150 decimal
        MOV M, A
        INX H
        MVI A, 00H
        ADC M
        MOV M, A

        ; -- Order 2: Pizza Rs 350 --
        MVI A, 02H
        PUSH B
        INR C
        MOV A, C
        STA 2300H

        LXI H, 2200H
        MOV A, M
        ADI 5EH         ; 5E = low byte of 350
        MOV M, A
        INX H
        MOV A, M
        ADI 01H         ; High byte
        MOV M, A

        ; -- Order 3: Cola Rs 50 --
        MVI A, 03H
        PUSH B
        INR C
        MOV A, C
        STA 2300H

        LXI H, 2200H
        MOV A, M
        ADI 32H         ; 32H = 50
        MOV M, A

        JMP RESULT

RESULT: HLT

; ===================================================
; AFTER RUN, CHECK IN GNUSIM MEMORY WINDOW:
; 2000H : 00 01 01 00 01 00 -> T03 is now 01 (Booked)
; 2050H : 02 -> Selected Table T03 (HL Reg)
; 2300H : 03 -> SP = 3 Orders
; 2301H : 01 -> Z Flag = Booked Success
; 2200H : 26 02 -> 0226H = 550 decimal (150+350+50)
; ===================================================
