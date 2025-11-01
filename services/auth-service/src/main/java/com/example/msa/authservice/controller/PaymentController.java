package com.example.msa.authservice.controller;


import com.example.msa.authservice.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {
    //Todo 금액부분 베이식,프로,엔터프라이즈에 맞게 바꾸기.. 결제성공했으니 구독 기능만들기


    private final PaymentService paymentService;

    @PostMapping("/request")
    @Operation(summary = "결제요청(구독신청)")
    public ResponseEntity<PaymentResponse> paymentRequest(@RequestBody PaymentRequest request) {
        Payment payment = paymentService.requestPayment(request);
        return ResponseEntity.ok(new PaymentResponse(payment.getAmount(), payment.getPaymentMethod(), payment.getOrderNumber()));
    }

    @PostMapping("/confirm")
    @Operation(summary = "결제 승인 처리")
    public ResponseEntity<Long> paymentConfirm(@RequestBody PaymentConfirmRequest request) {
        Payment payment = paymentService.paymentConfirm(request);
        return ResponseEntity.ok(payment.getId());
    }

}
