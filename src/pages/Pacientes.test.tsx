// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "../i18n";
import { ClinicProvider } from "../store/ClinicContext";
import Pacientes from "./Pacientes";

afterEach(cleanup);

const renderizar = () =>
  render(
    <ClinicProvider>
      <Pacientes />
    </ClinicProvider>,
  );

describe("busca de pacientes", () => {
  it("filtra pelo nome ignorando maiúsculas", () => {
    renderizar();
    fireEvent.change(screen.getByPlaceholderText("Buscar paciente"), { target: { value: "maria" } });
    expect(screen.getByText("Maria Souza")).toBeTruthy();
    expect(screen.queryByText("João Pereira")).toBeNull();
  });

  it("mostra mensagem quando nenhum paciente bate", () => {
    renderizar();
    fireEvent.change(screen.getByPlaceholderText("Buscar paciente"), { target: { value: "zzzz" } });
    expect(screen.getByText("Nenhum paciente encontrado.")).toBeTruthy();
  });
});
