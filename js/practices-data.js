/* ============================================
   PRACTICES-DATA.JS — Данные заданий для практик
   3 темы × 5 уровней × 3-4 задания
   ============================================ */

const PRACTICES_DATA = {

  // =============================================
  // PYTHON
  // =============================================
  python: {
    title: 'Понимание Python-разработки',
    icon: '../pic/py.png',
    color: '#3776AB',
    description: 'От переменных и print() до классов и ООП',
    levels: [
      {
        title: 'Основы синтаксиса',
        description: 'Функция print, переменные, комментарии — первые шаги в Python',
        tasks: [
          {
            type: 'choice',
            question: 'Какая функция используется для вывода текста на экран в Python?',
            options: ['echo()', 'print()', 'console.log()', 'printf()'],
            correct: 1
          },
          {
            type: 'input',
            question: 'Напишите команду Python, которая выведет на экран слово Hello',
            answers: ["print('Hello')", 'print("Hello")', "print( 'Hello' )", 'print( "Hello" )']
          },
          {
            type: 'choice',
            question: 'Как правильно создать переменную с числом 10 в Python?',
            options: ['int x = 10', 'var x = 10', 'x = 10', 'let x = 10'],
            correct: 2
          },
          {
            type: 'input',
            question: "Напишите однострочный комментарий в Python со словом тест",
            answers: ['# тест', '#тест', '# Тест', '#Тест']
          }
        ]
      },
      {
        title: 'Типы данных и операции',
        description: 'Числа, строки, преобразование типов и арифметика',
        tasks: [
          {
            type: 'choice',
            question: 'Какой тип данных у значения 3.14 в Python?',
            options: ['int', 'float', 'double', 'decimal'],
            correct: 1
          },
          {
            type: 'choice',
            question: "Что вернёт выражение type('Привет') в Python?",
            options: ["<class 'char'>", "<class 'text'>", "<class 'str'>", "<class 'string'>"],
            correct: 2
          },
          {
            type: 'input',
            question: "Напишите выражение, которое преобразует строку '42' в целое число",
            answers: ["int('42')", 'int("42")']
          },
          {
            type: 'choice',
            question: 'Что выведет print(10 // 3)?',
            options: ['3.33', '3', '3.0', '4'],
            correct: 1
          }
        ]
      },
      {
        title: 'Условия и циклы',
        description: 'Ветвления if/else, циклы for и while, функция range',
        tasks: [
          {
            type: 'choice',
            question: 'Какое ключевое слово используется для условного ветвления в Python?',
            options: ['switch', 'if', 'when', 'case'],
            correct: 1
          },
          {
            type: 'input',
            question: 'Напишите условие, которое проверяет, что переменная x больше 5',
            answers: ['if x > 5:', 'if x>5:']
          },
          {
            type: 'choice',
            question: 'Сколько раз выполнится тело цикла for i in range(3):?',
            options: ['2', '3', '4', '1'],
            correct: 1
          },
          {
            type: 'input',
            question: 'Напишите цикл for, который перебирает числа от 0 до 4 (используя range)',
            answers: ['for i in range(5):', 'for i in range(0, 5):', 'for i in range( 5 ):']
          }
        ]
      },
      {
        title: 'Функции и списки',
        description: 'Определение функций, работа со списками, методы списков',
        tasks: [
          {
            type: 'choice',
            question: 'Как определить функцию в Python?',
            options: ['function greet():', 'def greet():', 'fn greet():', 'func greet():'],
            correct: 1
          },
          {
            type: 'input',
            question: 'Напишите определение функции с именем hello, которая не принимает аргументов',
            answers: ['def hello():', 'def hello( ):']
          },
          {
            type: 'choice',
            question: 'Что вернёт len([10, 20, 30])?',
            options: ['2', '3', '30', '60'],
            correct: 1
          },
          {
            type: 'input',
            question: 'Напишите выражение, которое добавляет число 5 в конец списка my_list',
            answers: ['my_list.append(5)']
          }
        ]
      },
      {
        title: 'Основы ООП',
        description: 'Классы, конструктор __init__, параметр self, наследование',
        tasks: [
          {
            type: 'choice',
            question: 'Какое ключевое слово используется для создания класса в Python?',
            options: ['struct', 'object', 'class', 'type'],
            correct: 2
          },
          {
            type: 'input',
            question: 'Напишите объявление пустого класса с именем Animal',
            answers: ['class Animal:', 'class Animal():', 'class Animal(object):']
          },
          {
            type: 'choice',
            question: 'Как называется метод-конструктор класса в Python?',
            options: ['__init__', '__new__', 'constructor', '__create__'],
            correct: 0
          },
          {
            type: 'choice',
            question: 'Что обозначает параметр self в методах класса Python?',
            options: [
              'Ссылка на родительский класс',
              'Ссылка на текущий экземпляр объекта',
              'Ключевое слово для статических методов',
              'Имя модуля'
            ],
            correct: 1
          }
        ]
      }
    ]
  },

  // =============================================
  // HTML / WEB
  // =============================================
  html: {
    title: 'Основы веб-разработки',
    icon: '../pic/veb.png',
    color: '#E34F26',
    description: 'От базовых тегов до CSS-стилей и JavaScript',
    levels: [
      {
        title: 'Базовые теги',
        description: 'Структура HTML-документа, заголовки, абзацы, изображения',
        tasks: [
          {
            type: 'choice',
            question: 'Какой тег является корневым элементом HTML-документа?',
            options: ['<body>', '<head>', '<html>', '<document>'],
            correct: 2
          },
          {
            type: 'input',
            question: 'Напишите тег для создания абзаца с текстом Привет',
            answers: ['<p>Привет</p>']
          },
          {
            type: 'choice',
            question: 'Какой тег используется для заголовка первого уровня?',
            options: ['<header>', '<heading>', '<h1>', '<title>'],
            correct: 2
          },
          {
            type: 'input',
            question: 'Напишите тег для вставки изображения с адресом logo.png',
            answers: ['<img src="logo.png">', '<img src="logo.png" />', "<img src='logo.png'>", "<img src='logo.png' />"]
          }
        ]
      },
      {
        title: 'Структура страницы',
        description: 'Ссылки, списки, навигация, подключение стилей',
        tasks: [
          {
            type: 'choice',
            question: 'В каком теге подключаются CSS-стили через внешний файл?',
            options: ['<style>', '<css>', '<link>', '<script>'],
            correct: 2
          },
          {
            type: 'choice',
            question: 'Какой тег используется для создания нумерованного списка?',
            options: ['<ul>', '<nl>', '<ol>', '<list>'],
            correct: 2
          },
          {
            type: 'input',
            question: 'Напишите тег ссылки на https://texel.ru с текстом TEXEL',
            answers: ['<a href="https://texel.ru">TEXEL</a>', "<a href='https://texel.ru'>TEXEL</a>"]
          },
          {
            type: 'choice',
            question: 'Какой тег используется для создания раздела навигации в HTML5?',
            options: ['<navigation>', '<nav>', '<menu>', '<navbar>'],
            correct: 1
          }
        ]
      },
      {
        title: 'Формы и ввод',
        description: 'Поля ввода, типы input, атрибуты форм',
        tasks: [
          {
            type: 'choice',
            question: 'Какой тег создаёт поле для ввода текста?',
            options: ['<textfield>', '<input>', '<textarea>', '<field>'],
            correct: 1
          },
          {
            type: 'input',
            question: "Напишите тег input с типом password и placeholder 'Пароль'",
            answers: [
              '<input type="password" placeholder="Пароль">',
              '<input type="password" placeholder="Пароль" />',
              "<input type='password' placeholder='Пароль'>",
              "<input type='password' placeholder='Пароль' />"
            ]
          },
          {
            type: 'choice',
            question: 'Какой атрибут тега form определяет URL, куда отправляются данные?',
            options: ['href', 'src', 'action', 'target'],
            correct: 2
          },
          {
            type: 'choice',
            question: 'Какой тип input используется для чекбокса?',
            options: ['check', 'checkbox', 'toggle', 'tick'],
            correct: 1
          }
        ]
      },
      {
        title: 'Основы CSS',
        description: 'Селекторы, цвета, фон, скругление углов',
        tasks: [
          {
            type: 'choice',
            question: 'Какое CSS-свойство изменяет цвет текста?',
            options: ['font-color', 'text-color', 'color', 'foreground'],
            correct: 2
          },
          {
            type: 'input',
            question: 'Напишите CSS-правило, которое делает фон body чёрным',
            answers: [
              'body { background: black; }',
              'body { background-color: black; }',
              'body { background: #000; }',
              'body { background-color: #000; }',
              'body { background: #000000; }',
              'body { background-color: #000000; }',
              'body{background:black;}',
              'body{background-color:black;}'
            ]
          },
          {
            type: 'choice',
            question: 'Какой CSS-селектор выбирает элемент по id?',
            options: ['.', '#', '@', '&'],
            correct: 1
          },
          {
            type: 'choice',
            question: 'Какое CSS-свойство используется для скругления углов?',
            options: ['corner-radius', 'border-radius', 'radius', 'round-corners'],
            correct: 1
          }
        ]
      },
      {
        title: 'Основы JavaScript',
        description: 'Подключение скриптов, консоль, DOM, события',
        tasks: [
          {
            type: 'choice',
            question: 'Какой тег используется для подключения JavaScript на HTML-странице?',
            options: ['<js>', '<javascript>', '<script>', '<code>'],
            correct: 2
          },
          {
            type: 'input',
            question: "Напишите JavaScript-команду для вывода слова Test в консоль",
            answers: ["console.log('Test');", 'console.log("Test");', "console.log('Test')", 'console.log("Test")']
          },
          {
            type: 'choice',
            question: 'Какой метод получает HTML-элемент по его id?',
            options: ['document.getElement()', 'document.query()', 'document.getElementById()', 'document.findById()'],
            correct: 2
          },
          {
            type: 'choice',
            question: 'Что делает addEventListener в JavaScript?',
            options: [
              'Создаёт HTML-элемент',
              'Добавляет CSS-стиль',
              'Привязывает обработчик события к элементу',
              'Отправляет запрос на сервер'
            ],
            correct: 2
          }
        ]
      }
    ]
  },

  // =============================================
  // 3D-МОДЕЛИРОВАНИЕ
  // =============================================
  modeling: {
    title: '3D-моделирование',
    icon: '../pic/3d.png',
    color: '#FF6B35',
    description: 'От понятий полигонов до рендеринга и текстур',
    levels: [
      {
        title: 'Основные понятия',
        description: 'Полигоны, вершины, рендеринг — базовый словарь 3D',
        tasks: [
          {
            type: 'choice',
            question: 'Из каких базовых элементов строятся 3D-модели?',
            options: ['Пиксели', 'Полигоны (многоугольники)', 'Вектора', 'Слои'],
            correct: 1
          },
          {
            type: 'choice',
            question: 'Как называется точка соединения рёбер в 3D-модели?',
            options: ['Нода', 'Вертекс (вершина)', 'Пиксель', 'Анкор'],
            correct: 1
          },
          {
            type: 'input',
            question: 'Как называется процесс создания финального изображения из 3D-сцены? (одно слово)',
            answers: ['рендеринг', 'Рендеринг', 'рендер', 'Рендер']
          },
          {
            type: 'choice',
            question: 'Какая из программ является бесплатным 3D-редактором с открытым кодом?',
            options: ['3ds Max', 'Maya', 'Blender', 'Cinema 4D'],
            correct: 2
          }
        ]
      },
      {
        title: 'Примитивы и трансформации',
        description: 'Базовые фигуры, оси координат, перемещение и масштабирование',
        tasks: [
          {
            type: 'choice',
            question: 'Какой из объектов НЕ является стандартным 3D-примитивом?',
            options: ['Куб', 'Сфера', 'Спираль', 'Цилиндр'],
            correct: 2
          },
          {
            type: 'choice',
            question: 'Какие три базовые трансформации применяются к объектам в 3D?',
            options: [
              'Копирование, вставка, удаление',
              'Перемещение, вращение, масштабирование',
              'Создание, изменение, рендеринг',
              'Импорт, экспорт, сохранение'
            ],
            correct: 1
          },
          {
            type: 'input',
            question: 'Сколько осей координат используется в 3D-пространстве? (число)',
            answers: ['3', 'три', 'Три']
          },
          {
            type: 'choice',
            question: 'Как называются оси в 3D-пространстве?',
            options: ['A, B, C', 'X, Y, Z', 'L, W, H', '1, 2, 3'],
            correct: 1
          }
        ]
      },
      {
        title: 'Техники моделирования',
        description: 'Экструзия, subdivision, булевы операции, ретопология',
        tasks: [
          {
            type: 'choice',
            question: 'Как называется техника моделирования путём вытягивания граней полигона?',
            options: ['Скульптинг', 'Булевы операции', 'Экструзия', 'Деформация'],
            correct: 2
          },
          {
            type: 'choice',
            question: 'Что такое subdivision surface (подразделение поверхности)?',
            options: [
              'Разделение модели на части',
              'Автоматическое сглаживание полигональной сетки',
              'Удаление лишних полигонов',
              'Создание копий объекта'
            ],
            correct: 1
          },
          {
            type: 'input',
            question: 'Как называется операция объединения или вычитания двух 3D-объектов? (два слова)',
            answers: ['булева операция', 'булевы операции', 'Булева операция', 'Булевы операции']
          },
          {
            type: 'choice',
            question: 'Что такое ретопология?',
            options: [
              'Добавление текстур на модель',
              'Перестройка полигональной сетки для оптимизации',
              'Создание скелета для анимации',
              'Настройка освещения сцены'
            ],
            correct: 1
          }
        ]
      },
      {
        title: 'Материалы и текстуры',
        description: 'Свойства поверхностей, UV-развёртка, карты нормалей, PBR',
        tasks: [
          {
            type: 'choice',
            question: 'Что определяет материал 3D-объекта?',
            options: [
              'Только цвет',
              'Форму объекта',
              'Внешний вид поверхности: цвет, блеск, прозрачность',
              'Размер объекта'
            ],
            correct: 2
          },
          {
            type: 'choice',
            question: 'Как называется процесс наложения 2D-изображения на 3D-модель?',
            options: ['Рендеринг', 'Скиннинг', 'UV-маппинг (текстурирование)', 'Шейдинг'],
            correct: 2
          },
          {
            type: 'input',
            question: 'Как называется карта, имитирующая неровности поверхности без изменения геометрии? (по-английски)',
            answers: ['normal map', 'Normal Map', 'Normal map', 'bump map', 'Bump Map', 'Bump map']
          },
          {
            type: 'choice',
            question: 'Что такое PBR в контексте 3D-материалов?',
            options: [
              'Pixel Based Resolution',
              'Physically Based Rendering',
              'Point Based Reflection',
              'Polygon Based Rendering'
            ],
            correct: 1
          }
        ]
      },
      {
        title: 'Рендеринг и свет',
        description: 'Источники света, трассировка лучей, глубина резкости, рендер-движки',
        tasks: [
          {
            type: 'choice',
            question: 'Какой тип источника света освещает сцену равномерно со всех сторон?',
            options: ['Точечный свет', 'Направленный свет', 'Ambient (окружающий) свет', 'Прожектор'],
            correct: 2
          },
          {
            type: 'choice',
            question: 'Что такое трассировка лучей (ray tracing)?',
            options: [
              'Метод сжатия 3D-файлов',
              'Алгоритм расчёта освещения путём симуляции лучей света',
              'Способ рисования контуров модели',
              'Техника анимации'
            ],
            correct: 1
          },
          {
            type: 'input',
            question: 'Как называется эффект размытия объектов не в фокусе камеры? (по-английски)',
            answers: ['depth of field', 'Depth of Field', 'Depth of field', 'DOF', 'dof']
          },
          {
            type: 'choice',
            question: 'Какой рендер-движок встроен в Blender и использует трассировку лучей?',
            options: ['V-Ray', 'Arnold', 'Cycles', 'Corona'],
            correct: 2
          }
        ]
      }
    ]
  }
};
