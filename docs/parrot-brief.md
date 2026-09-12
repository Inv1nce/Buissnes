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

---

## 7. Разбор первого листа

Первый прогон дал очень хороший стиль: плоская векторная заливка,
спокойная птица без мультяшности, палитра почти точно попала в сайт,
фон прозрачный. Это база, её менять не нужно.

Что мешает собрать из этого анимацию:

1. **Птица смотрит в разные стороны.** Три сидящие позы смотрят влево,
   три в полёте — вправо. В анимации она будет разворачиваться на 180°
   при каждой смене кадра.
2. **В полёте видны опущенные лапы.** Так читается «машет крыльями,
   стоя на земле», а не «летит». В полёте лапы подбираются под хвост.
3. **Хохолок и щека гуляют от кадра к кадру.** На одной позе хохолок
   зачёсан назад, на другой торчит вверх, пятно у глаза разной формы.
   При переключении кадров голова будет «дёргаться».
4. **Разный масштаб и разная высота лап.** Кадры придётся выравнивать
   руками в любом редакторе — ни одна модель не даёт совпадения по пикселю.
5. **Нет позы «осматривается»** — голова поднята вверх.
6. **Местами три четверти вместо строгого профиля** — видно второе крыло
   и слишком фронтальное пятно у глаза.

### Что оставить как эталон

Поза с опущенной к крылу головой и закрытым глазом (верхний ряд, справа) —
лучшая на листе. Используйте её референсом для всей серии чистки перьев.

### Промт для второго прогона

```
Using the attached reference sheet, redraw the SAME parrot as a corrected
character sheet. Keep the exact style, shapes and colours of the reference.

Fix these things:
- EVERY pose must face RIGHT. The beak points right, the tail points left.
  No mirrored poses, no exceptions.
- Strict side profile in every pose. Only one wing visible, only one eye
  visible, the cheek patch seen from the side, never from the front.
- The crest, the cheek patch and the beak must be IDENTICAL in shape and
  size in every single pose. Do not restyle the head between poses.
- In all flying poses the legs are tucked up under the tail and hidden.
  No feet, no legs, no standing pose while the wings are spread.
- All poses at exactly the same scale and the same camera distance.
- In the perched poses the feet rest on one common invisible baseline.
- In the flying poses the centre of the body sits at one common height.

SIX poses, two rows of three, evenly spaced, transparent background:
1. perched, wings folded, head level, calm, eye open
2. perched, head raised and tilted upward, looking up and around, alert
3. perched, head lowered and tucked into the folded wing, eye closed, preening
4. flying, legs tucked, wings raised high above the back
5. flying, legs tucked, wings spread horizontally
6. flying, legs tucked, wings pushed down below the body

No ground, no branch, no shadow, no text, no labels, no watermark.
```

После того как лист получится ровным, по нему генерируются 14 отдельных
кадров из раздела 4 — уже по одному, каждый на своём холсте.

### Сборка ленты

Кадры складываются в одну картинку сеткой 5 колонок × 3 ряда,
клетка квадратная (например 256×256), порядок слева направо и сверху вниз:

| № | Кадр | № | Кадр |
|---|---|---|---|
| 0 | полёт, крылья вверху | 7 | моргает |
| 1 | полёт, крылья горизонтально | 8 | смотрит вверх |
| 2 | полёт, крылья внизу | 9 | смотрит прямо |
| 3 | полёт, крылья поднимаются | 10 | смотрит вниз |
| 4 | посадка, крылья тормозят | 11 | голова пошла к крылу |
| 5 | посадка, лапы коснулись | 12 | клюв в перьях |
| 6 | сидит спокойно | 13 | голова поднимается |

Клетка 14 остаётся пустой.

Дальше в `assets/js/main.js` в блоке `PARROT` наверху файла:

```js
var PARROT = {
  sprite: 'assets/parrot.png',
  cols: 5,
  rows: 3,
  ...
};
```

Всё остальное код сделает сам: полёт зациклит, посадку проиграет один раз,
осматривание и чистку перьев — туда и обратно, в остальное время покажет
кадр «сидит спокойно».

---

## 8. Разбор второго листа и смена подхода

Второй прогон дал более цельного персонажа: хохолок, щека и клюв
наконец совпадают между позами, появилась полезная панель «Head and
Beak Detail», а в нижнем ряду модель отреагировала на требование общей
базовой линии и даже нарисовала направляющие.

Но собрать из этого анимацию по-прежнему нельзя:

1. **Лист превратился в плакат.** Подписи, выноски «nostril», размеры
   «25 mm», заголовки разделов, легенда цветов, полный разворот
   Front / Side / Back. В промте стояло «no text, no labels», но слова
   «reference sheet», «key-frames», «checklist» тянут модель в сторону
   оформленного постера. Кадры из такого листа резать нельзя.
2. **Палитра поехала.** В легенде `#BF202F` и `#00707F`, причём третий
   образец коричневый, а подписан тем же красным номером — модель не
   отслеживает собственные коды. `#00707F` заметно холоднее и синее
   нашего `#1F6F5C`.
3. **Направление снова разъехалось**: сидящие позы смотрят влево,
   полётные вправо. Третий прогон подряд.
4. **В полёте по-прежнему видны лапы.**
5. **Позы «смотрит вверх» так и нет.**

### Вывод: генератор — для дизайна, не для кадров

Дизайн персонажа можно считать утверждённым. Дальше бороться за
попиксельно совпадающие кадры невыгодно: модель их не даёт, а ручное
выравнивание четырнадцати растровых кадров — работа на полдня, которую
придётся повторять при любой правке.

**Правильный следующий шаг — не кадры, а вектор.** Утверждённый дизайн
перерисовывается в векторе один раз, отдельными частями: голова, клюв,
хохолок, глаз, крыло, хвост, лапы. Дальше анимируются сами части —
ровно так, как уже устроен попугай в `index.html`.

Что это даёт:

- проблема выравнивания исчезает: это одна фигура, а не набор кадров;
- вес — килобайты вместо сотен килобайт растра;
- любое состояние собирается поворотом частей, попиксельное совпадение
  не нужно;
- если позже захочется Rive — вектор уже готов, останется собрать
  машину состояний.

Как получить вектор:

- **Автотрейс.** Открыть лучшую позу в Illustrator (Image Trace) или
  Inkscape (Trace Bitmap), почистить лишние узлы, разложить по слоям.
  Реально сделать самому за вечер.
- **Иллюстратор.** Отдать утверждённый лист и этот документ — час-два
  работы, зато чистые кривые и правильно разложенные части.

Требования к слоям для аниматора:

| Слой | Зачем |
|---|---|
| `parrot-head-group` | голова целиком: череп, хохолок, щека, клюв, глаз |
| `parrot-eye` | зрачок или веко отдельно — для моргания |
| `parrot-wing` | сложенное крыло |
| `parrot-wing-fly` | раскрытое крыло, видно только в полёте |
| `parrot-body` | туловище |
| `parrot-tail` | хвост |
| `parrot-foot` | лапы, видны только когда птица сидит |

Точки вращения: шея для головы, плечо для крыла. Имена классов лучше
сохранить — тогда графика встанет на место без правки кода и CSS.
