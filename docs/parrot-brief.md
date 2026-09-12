# Попугай: бриф на графику и промты

Документ для того, кто будет делать картинку — вам самим в генераторе,
иллюстратору или аниматору. Здесь требования к ассету и готовые промты.

---

## 1. Что именно нужно

Попугай сидит на элементах страницы и ведёт себя как живая птица:
прилетает, садится, осматривается, изредка чистит перья. Это **не одна
картинка, а набор состояний**. Код уже умеет их переключать —
см. `setState()` в `initParrot()`.

Нужные состояния:

| Состояние | Что происходит | Длительность |
|---|---|---|
| `fly` | летит между блоками, машет крыльями | пока летит, ~1,2 с |
| `perch` | сидит спокойно, изредка моргает | базовое |
| `look` | осматривается: голова вверх, пауза, вниз, пауза | 2,7 с |
| `preen` | ныряет клювом в перья, несколько коротких движений | 3,0 с |

Ритм задан в коде: пауза между действиями 3,5–9 секунд, чистка перьев
чуть реже, чем осматривание. Сейчас всё это работает на временном
SVG-попугае — можно открыть сайт и посмотреть, устраивает ли ритм,
до того как заказывать графику.

---

## 2. Технические требования к ассету

Это главное. Если их не соблюсти, анимация будет дёргаться.

- **Прозрачный фон.** PNG с альфа-каналом. Не белый, не чёрный, не шахматка.
- **Строгий профиль, птица смотрит влево.** Она летит слева направо
  и садится боком — вид спереди или три четверти работать не будет.
- **Одинаковый холст во всех кадрах**, например 1024×1024.
- **Одинаковый масштаб и одинаковое расстояние камеры.** Птица не должна
  становиться крупнее или мельче от кадра к кадру.
- **Общая точка опоры.** В кадрах, где птица сидит, **лапы должны стоять
  на одной и той же высоте** — иначе при смене кадра она будет прыгать.
  В кадрах полёта на одной высоте должен быть центр туловища.
- **Без тени на землю, без подставки, без ветки, без фона.**
  Птица садится на наш красный крестик, любая своя опора всё сломает.
- **Ровный рассеянный свет.** Без жёсткого бокового света, без бликов
  и контрового света: на странице свет плоский, и кадр с драматичной
  подсветкой будет выглядеть вклеенным.
- **Палитра сайта, без посторонних оттенков.**

| Что | Цвет |
|---|---|
| туловище, грудь | `#C42B1F` |
| крыло, хвост | `#1F6F5C` |
| клюв, щека | `#B5821F` |
| блики, кольцо вокруг глаза | `#F6EFE1` |
| глаз, коготь | `#2B2119` |

Никакой синевы и радужного оперения: настоящие ара сине-жёлтые,
но такая птица выбьется из палитры сайта.

---

## 3. Промт для листа персонажа (Nano Banana Pro)

Делается **первым**. Даёт единого персонажа, на который потом ссылаются
все остальные кадры. Промты на английском — модели точнее держат
художественные термины.

```
Character reference sheet of ONE stylized parrot for a website illustration.

Style: semi-flat vector illustration with a subtle paper grain, clean confident
shapes, restrained detail — closer to modern editorial illustration than to a
photograph. Serious and elegant, NOT a cartoon mascot: no oversized eyes, no
smile, no human expression, no outline stroke.

The bird: a compact macaw-like parrot. Body about three head-heights long,
short rounded tail (not a long streamer tail), strong hooked beak, visible
scaly feet with two toes forward and two back, small crest feathers on the head.

Colour palette — use ONLY these five colours, flat fills with at most one
subtle darker shade per area:
body and chest deep brick red #C42B1F,
wing and tail deep sea green #1F6F5C,
beak and cheek patch warm ochre #B5821F,
eye ring and highlights warm cream #F6EFE1,
eye and claws dark brown #2B2119.
No blue, no yellow, no rainbow plumage, no gradients.

Lighting: perfectly even diffuse light. No directional key light, no rim light,
no reflections, no cast shadow, no ambient occlusion.

Layout: SIX poses of the SAME bird on one sheet, every pose in strict
left-facing side profile, all at identical scale and identical camera distance,
evenly spaced in two rows of three, on a fully transparent background:
1. perched calmly, wings folded against the body, head level
2. perched, head turned and tilted upward, looking up
3. perched, head lowered and tucked toward the folded wing, beak touching the
   wing feathers (preening)
4. flying, wings raised at the top of the stroke
5. flying, wings horizontal, mid-stroke
6. flying, wings pushed down at the bottom of the stroke

Transparent background. No ground, no branch, no perch, no shadow, no frame,
no text, no watermark, no colour swatches, no labels.
```

**Отрицательный промт** (если поле есть):

```
photorealistic feathers, blue macaw, rainbow colours, cartoon mascot, big cute
eyes, thick black outline, background, sky, branch, drop shadow, ground shadow,
text, labels, watermark, multiple different birds, three-quarter view, front view
```

---

## 4. Промт для отдельного кадра

Лист персонажа подаётся **референсом**, дальше по одному кадру.
Так вы получите чистые PNG нужного размера.

```
Using the attached reference sheet, render ONLY the parrot in a single pose,
exactly the same character, same colours, same style, same scale.

Pose: [подставить из списка ниже]

Strict left-facing side profile. Square canvas, the bird occupies about 60% of
the frame height and is centred. [Для сидящих кадров:] the feet must rest on the
exact same baseline as in the reference sheet. [Для кадров полёта:] the centre of
the body must sit at the exact same height as in the reference sheet.

Fully transparent background, no shadow, no ground, no perch, no text.
```

Список поз — ровно то, что ждёт код:

**Полёт** (4 кадра, зациклены)
1. `wings raised high above the back, tips almost touching`
2. `wings spread horizontally, mid downstroke`
3. `wings pushed down below the body`
4. `wings rising back up, mid upstroke`

**Посадка** (2 кадра)
5. `wings spread wide and cupped forward to brake, legs reaching forward, tail fanned`
6. `wings half folded, feet just touching down, body upright`

**Сидит** (2 кадра)
7. `perched calmly, wings folded, head level, eye open`
8. `same pose, eye closed (blink)`

**Осматривается** (3 кадра)
9. `perched, head turned and tilted up, looking upward`
10. `perched, head level, alert`
11. `perched, head tilted down, looking at the ground`

**Чистит перья** (3 кадра)
12. `perched, head starting to turn down toward the folded wing`
13. `perched, beak buried in the wing feathers, head low`
14. `perched, head lifting back up, beak slightly open`

Итого 14 кадров.

---

## 5. Если делать объёмного попугая

Тогда стиль другой — не иллюстрация, а мягкий объёмный рендер.
Фотореализм на пергаментной странице будет выглядеть вклеенным,
поэтому просите «винил» или «глину», а не перья крупным планом:

```
3D render of a stylized parrot, soft matte vinyl toy material, smooth simplified
feathers suggested by shape rather than texture, no individual feather strands.
Single soft studio light from the front, very soft ambient shadow only on the
body itself, no cast shadow on the ground.
Colours: body #C42B1F, wing and tail #1F6F5C, beak #B5821F, eye #2B2119.
Left-facing side profile, transparent background, no ground plane, no reflections.
```

Важно понимать: **генератор картинок не сделает объёмную модель.**
Он нарисует картинку, похожую на рендер. Настоящий трёхмерный попугай,
который поворачивает голову в реальном времени, — это файл `.glb`
со скелетом и клипами анимации плюс three.js на странице.
Такую модель либо покупают готовой, либо заказывают.

---

## 6. Как вставить готовую графику

### Одна картинка (самое простое)

В `index.html` заменить содержимое `<span class="parrot" id="parrot">`:

```html
<span class="parrot" id="parrot">
  <img src="assets/parrot.png" alt="">
</span>
```

Перелёты и посадки останутся, взмахов крыльев и чистки перьев не будет.

### Спрайт-лист (рекомендуется для растровых кадров)

Сложить 14 кадров в одну ленту, задать в CSS `background-image`
и проигрывать `steps()`. Состояния переключает тот же `setState()`.

### Rive (лучший вариант для описанного поведения)

Собрать в Rive машину состояний с входами `fly`, `perch`, `look`, `preen`.
Тогда `setState()` вместо классов дёргает входы машины состояний,
а плавные переходы между состояниями Rive считает сам.

### Объёмная модель

`.glb` со скелетом и клипами, three.js, `AnimationMixer`.
Самый тяжёлый и дорогой путь.

Во всех четырёх случаях меняется **только** функция `setState()`
и содержимое `<span class="parrot">`. Логика перелётов, пауз
и выбора действий остаётся как есть.
