# Changelog

## 2.1.0

- Notificações de confirmação para salvar, agendar, mudar status, excluir e exportar.
- Exportação da agenda do profissional em arquivo .ics (Google Agenda, Outlook, Apple Calendar).
- Backup completo: exportar tudo em JSON e restaurar a partir do arquivo, com validação.
- Relatórios por profissional: agendadas, realizadas, faltas, canceladas e taxa de faltas.
- Impressão do prontuário e dos relatórios com layout próprio.
- Testes para exportação .ics, backup e cálculo de relatórios.

## 2.0.0

Front-end completo, sem back-end (dados em memória com persistência no navegador).

### Agenda
- Agendar clicando no calendário ou pelo botão "Novo agendamento" (acessível por teclado).
- Duração de 15 a 90 minutos; arrastar para remarcar com checagem de conflito.
- Bloqueio de horário fora do expediente da clínica e do profissional, e de horário já passado.
- Status (agendada, realizada, faltou, cancelada) com confirmação antes de cancelar e de excluir.
- Filtros por status e paciente, resumo do dia e visão de dia automática no celular.

### Pacientes
- Cadastro com máscaras, validação de CPF (sem duplicados) e data de nascimento.
- Busca por nome ou telefone, com atalho "/".
- Prontuário com consultas vinculadas, anotações editáveis e exclusão com confirmação.
- Resumo do histórico com IA (Groq), com cache e mensagem de erro.

### Profissionais e configurações
- Cadastro, edição e desativação de profissionais, com expediente próprio.
- Nome, horário de funcionamento e chave da Groq por usuário.
- Carregamento de dados de demonstração.

### Experiência
- Tema dia, noite e automático, com céu animado e logo em SVG.
- PWA instalável com cache offline.
- Navegação inferior no celular, esqueleto de carregamento e estados vazios.
- Interface em português e inglês.

### Qualidade
- 22 testes (regras de negócio e fluxos da agenda).
- Lint sem avisos.
- Pipeline de CI no GitHub Actions.

### Conhecidos
- A chave da Groq fica no navegador do usuário; a proteção real depende de um back-end (adiado).
- Sem notificações tipo "toast" para confirmar ações.
