import { describe, expect, it } from "vitest";
import { isValidCPF, maskCPF, maskPhone } from "./format";

describe("maskCPF", () => {
  it("formata CPF completo", () => {
    expect(maskCPF("12345678909")).toBe("123.456.789-09");
  });
  it("ignora caracteres não numéricos e limita a 11 dígitos", () => {
    expect(maskCPF("123.456.789-09999")).toBe("123.456.789-09");
  });
});

describe("maskPhone", () => {
  it("formata celular com 11 dígitos", () => {
    expect(maskPhone("34999990000")).toBe("(34) 99999-0000");
  });
  it("formata fixo com 10 dígitos", () => {
    expect(maskPhone("3432221100")).toBe("(34) 3222-1100");
  });
});

describe("isValidCPF", () => {
  it("aceita CPF válido", () => {
    expect(isValidCPF("123.456.789-09")).toBe(true);
  });
  it("rejeita dígito verificador errado", () => {
    expect(isValidCPF("12345678900")).toBe(false);
  });
  it("rejeita sequências repetidas", () => {
    expect(isValidCPF("11111111111")).toBe(false);
  });
  it("rejeita tamanho incorreto", () => {
    expect(isValidCPF("1234")).toBe(false);
  });
});
