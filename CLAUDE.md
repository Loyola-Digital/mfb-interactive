# MFB Interactive

Todo layout deste projeto usa o design system em `design-system/` (Meu Filho Bilíngue).

- Leia `design-system/README.md` antes de criar qualquer tela: voz, cores, tipografia e regras de uso.
- Carregue `design-system/tokens.css` e `design-system/components/bundle.css` e ponha `class="mfb"` no elemento raiz.
- Componentes são classes CSS `mfb-*`; cada um tem regras em `design-system/components/<Nome>/README.md` e marcação de exemplo em `preview.html`.
- Cores, espaços, raios e fontes só por variável (`var(--coral)`, `var(--space-5)`...). Nunca hex solto.
- Logos em `design-system/assets/Logos/`, personagens (Coco, Sol, Nino, Lulu) em `design-system/assets/Personagens/`.
- Exemplo funcionando: `design-system/exemplo.html`.
- `tokens.css` é gerado de `tokens.json`; se mudar um token, mude o JSON e regenere.
- Versão online (fonte da verdade visual): https://claude.ai/artifact/PmqjeMAFstK5VUhbM5Tzn3
- `reference/` são as referências de layout (THYNK). Inspiração de estilo, nunca copiar personagens ou marca.
