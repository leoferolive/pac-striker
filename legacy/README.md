# Neon Breach 3D: Tactical Ops

**Neon Breach 3D** é um Top-Down Shooter Tático (estilo Twin-Stick Shooter) com temática Cyberpunk/Sci-Fi. O jogador controla um "tanque" futurista em uma arena fechada, devendo sobreviver a ondas infinitas de inimigos ("vírus") que tentam encurralá-lo. O objetivo é pontuar o máximo possível antes de ser destruído.

## 🎮 Features Implementadas

### Engine de Física & Movimento
*   **Movimentação Vetorial**: Aceleração, inércia e atrito para um movimento fluido (não grid-based).
*   **Colisão Customizada**: Sistema Circular vs AABB com resolução de sobreposição (sliding) nas paredes.
*   **Mira de Precisão**: Raycasting projetando a posição do mouse em um plano 3D invisível na altura da arma.

### Inteligência Artificial (Steering Behaviors)
*   **Comportamento de Enxame**: Inimigos utilizam algoritmos de **Seek** (perseguir) e **Separation** (evitar colisão entre si) para um movimento orgânico.

### Sistema de Combate
*   **Arsenal Polimórfico**: 4 armas com atributos únicos (Dano, Cadência, Dispersão, Recuo).
    *   **Pistola**: Munição infinita.
    *   **Shotgun**: Alto spread, devastadora de perto.
    *   **Rifle**: Alta cadência.
    *   **Railgun**: Dano massivo e perfuração.
*   **Feedback Físico**: Recuo (empurrão) ao atirar e "camera shake".
*   **Balística**: Projéteis físicos com velocidade e colisão própria (não hitscan).

### Gráficos & Atmosfera
*   **Iluminação Dinâmica**: Spotlights (lanterna), PointLights (projéteis/pickups) e sombras em tempo real.
*   **Texturas Procedurais**: Chão gerado via Canvas API (Grid Neon Infinito).
*   **Partículas**: Explosões cúbicas e manchas de sangue persistentes.
*   **Post-Processing**: Efeitos de Vinheta e linhas CRT (CSS) para estética retrô.

## 🕹️ Controles

| Tecla | Ação |
| :--- | :--- |
| **W, A, S, D** | Movimentação |
| **Mouse** | Mira |
| **Botão Esquerdo** | Atirar |

## 🚀 Como Rodar

1.  Clone ou baixe este repositório.
2.  Abra o arquivo `index.html` em qualquer navegador moderno (Chrome, Firefox, Edge).
3.  Clique em **INICIAR** para começar a simulação.

## � Stack Tecnológica

*   **[Three.js](https://threejs.org/) (r128)**: Renderização 3D (Cenas, Câmeras, Malhas, Luzes).
*   **JavaScript (ES6+)**: Lógica orientada a objetos (`Player`, `Enemy`, `Game`).
*   **HTML5 Canvas API**: Geração de texturas dinâmicas.
*   **CSS3 / Tailwind**: UI e efeitos de pós-processamento (overlays).

---
*Tactical Engine v4.0 Online*
