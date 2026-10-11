"""Transkripsi manual dokumen berbasis gambar (slide carousel, catatan tulisan tangan).

Teks disalin dari gambar halaman lalu dicocokkan dengan OCR (tesseract). Kode yang terpotong di tepi gambar
(titik koma / kurung tutup) dilengkapi supaya bisa dikompilasi; selebihnya sama dengan sumber.
Hasil: <folder-out>/manual/<nama>.json dengan format bab & blok yang sama seperti konverter lain.

python3 -I manual_sources.py <folder-out>
"""
import json
import os
import sys


def H(t, level=3):
    return {'type': 'h', 'text': t, 'level': level}


def P(t):
    return {'type': 'p', 'text': t}


def L(*items, ordered=False):
    b = {'type': 'list', 'items': list(items)}
    if ordered:
        b['ordered'] = True
    return b


def C(code, lang='java', title=None):
    b = {'type': 'code', 'lang': lang, 'code': code.strip('\n')}
    if title:
        b['title'] = title
    return b


def T(head, rows):
    return {'type': 'table', 'head': head, 'rows': rows}


def N(title, text, tone='info'):
    return {'type': 'callout', 'tone': tone, 'title': title, 'text': text}


DOCS = {}

# ───────────────────────── 100 Lambda Code Snippets (Java 8) ─────────────────────────
SNIP = [
    (1, 'Simple Runnable Example', '''
Runnable r = () -> System.out.println("Hello, Lambda!");
new Thread(r).start();'''),
    (2, 'Iterating List using Lambda', '''
List<String> list = Arrays.asList("Java", "Spring", "Lambda");
list.forEach(item -> System.out.println(item));'''),
    (3, 'Filtering a List with Lambda', '''
List<String> list = Arrays.asList("Java", "JavaScript", "Python");
List<String> filteredList = list.stream()
                                .filter(s -> s.startsWith("J"))
                                .collect(Collectors.toList());
filteredList.forEach(System.out::println);'''),
    (4, 'Sorting a List using Lambda', '''
List<String> list = Arrays.asList("Java", "Lambda", "Kafka");
list.sort((s1, s2) -> s1.compareTo(s2));
list.forEach(System.out::println);'''),
    (5, 'Using a Custom Functional Interface', '''
@FunctionalInterface
interface Calculator {
    int calculate(int a, int b);
}
public static void main(String[] args) {
    Calculator add = (a, b) -> a + b;
    Calculator multiply = (a, b) -> a * b;
    println("Addition: " + add.calculate(5, 3));
    println("Multiplication: " + multiply.calculate(5, 3));
}'''),
    (6, 'Lambda with Map Iteration', '''
Map<String, Integer> map = new HashMap<>();
map.put("Java", 8);
map.put("Spring", 5);
map.put("Lambda", 1);
map.forEach((key, value) -> println(key + ": " + value));'''),
    (7, 'Creating a Thread with Lambda', '''
new Thread(() -> System.out.println("Thread with Lambda!")).start();'''),
    (8, 'Lambda in Comparator', '''
List<String> list = Arrays.asList("Java", "Lambda", "Kafka");
list.sort(Comparator.comparingInt(String::length));
list.forEach(System.out::println);'''),
    (9, 'Method Reference with Lambda', '''
List<String> list = Arrays.asList("Java", "Lambda", "Kafka");
list.forEach(System.out::println);'''),
    (10, 'Lambda with Optional', '''
Optional<String> optional = Optional.of("Java");
optional.ifPresent(s -> System.out.println("Value is present: " + s));'''),
    (11, 'Lambda with Predicate', '''
Predicate<String> isEmpty = s -> s.isEmpty();
System.out.println(isEmpty.test(""));      // true
System.out.println(isEmpty.test("Java"));  // false'''),
    (12, 'Lambda with BiFunction', '''
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
System.out.println(add.apply(2, 3));  // 5'''),
    (13, 'Lambda with Consumer', '''
Consumer<String> print = s -> System.out.println(s);
print.accept("Hello, World!");  // Hello, World!'''),
    (14, 'Lambda with Supplier', '''
Supplier<String> supplier = () -> "Java";
System.out.println(supplier.get());  // Java'''),
    (15, 'Lambda with Function', '''
Function<String, Integer> length = s -> s.length();
System.out.println(length.apply("Lambda"));  // 6'''),
    (16, 'Lambda with UnaryOperator', '''
UnaryOperator<Integer> square = x -> x * x;
System.out.println(square.apply(5));  // 25'''),
    (17, 'Lambda with BinaryOperator', '''
BinaryOperator<Integer> multiply = (a, b) -> a * b;
System.out.println(multiply.apply(2, 3));  // 6'''),
    (18, 'Lambda for Checking Even Numbers', '''
Predicate<Integer> isEven = x -> x % 2 == 0;
System.out.println(isEven.test(4));  // true
System.out.println(isEven.test(5));  // false'''),
    (19, 'Lambda with Custom Sorting', '''
List<String> list = Arrays.asList("Apple", "Pear", "Grapes");
list.sort((s1, s2) -> s2.compareTo(s1));// Sort, reverse order
list.forEach(System.out::println);'''),
    (20, 'Lambda for Uppercase Conversion', '''
List<String> list = Arrays.asList("java", "spring", "lambda");
List<String> upperList = list.stream()
                             .map(String::toUpperCase)
                             .collect(Collectors.toList());
upperList.forEach(System.out::println);'''),
    (21, 'Lambda with Stream Reduce', '''
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int sum = numbers.stream()
                 .reduce(0, (a, b) -> a + b);
System.out.println("Sum: " + sum);  // Sum: 15'''),
    (22, 'Lambda with Stream Filter', '''
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
List<Integer> evenNumbers = numbers.stream()
                                   .filter(n -> n % 2 == 0)
                                   .collect(Collectors.toList());
evenNumbers.forEach(System.out::println);  // 2, 4, 6, 8, 10'''),
    (23, 'Lambda with Stream Map', '''
List<String> list = Arrays.asList("Java", "Spring", "Lambda");
list.stream()
    .map(String::toLowerCase)
    .forEach(System.out::println);'''),
    (24, 'Lambda with Stream Distinct', '''
List<Integer> numbers = Arrays.asList(1, 2, 2, 3, 4, 4, 5);
numbers.stream()
       .distinct()
       .forEach(System.out::println);  // 1, 2, 3, 4, 5'''),
    (25, 'Lambda with Stream Sorted', '''
List<String> list = Arrays.asList("Banana", "Pear", "Grapes");
list.stream()
    .sorted()
    .forEach(System.out::println);'''),
    (26, 'Lambda with Stream Count', '''
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
long count = numbers.stream()
                    .count();
System.out.println("Count: " + count);  // Count: 5'''),
    (27, 'Lambda with Stream AnyMatch', '''
List<String> list = Arrays.asList("Java", "Spring", "Lambda");
boolean containsJava = list.stream()
                           .anyMatch(s -> s.equals("Java"));
System.out.println("Contains 'Java': " + containsJava);// true'''),
    (28, 'Lambda with Stream AllMatch', '''
List<Integer> numbers = Arrays.asList(2, 4, 6, 8, 10);
boolean allEven = numbers.stream()
                         .allMatch(n -> n % 2 == 0);
System.out.println("All even: " + allEven);  // true'''),
    (29, 'Lambda with Stream NoneMatch', '''
List<String> list = Arrays.asList("Java", "Spring", "Lambda");
boolean nonePython = list.stream()
                         .noneMatch(s -> s.equals("Python"));
System.out.println("Contains no 'Python': "+nonePython);//true'''),
    (30, 'Lambda with Stream FindFirst', '''
List<String> list = Arrays.asList("Java", "Spring", "Lambda");
Optional<String> first = list.stream()
                             .findFirst();
first.ifPresent(System.out::println);  // Java'''),
    (31, 'Lambda with Stream FindAny', '''
List<String> list = Arrays.asList("Java", "Spring", "Lambda");
Optional<String> any = list.stream()
                           .findAny();
any.ifPresent(System.out::println);'''),
    (32, 'Lambda for Summing Integers', '''
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int sum = numbers.stream()
                 .mapToInt(Integer::intValue)
                 .sum();
System.out.println("Sum: " + sum);  // Sum: 15'''),
    (34, 'Lambda for Max Integer', '''
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int max = numbers.stream()
                 .mapToInt(Integer::intValue)
                 .max()
                 .orElse(Integer.MIN_VALUE);
System.out.println("Max: " + max);  // Max: 5'''),
    (35, 'Lambda for Min Integer', '''
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int min = numbers.stream()
                 .mapToInt(Integer::intValue)
                 .min()
                 .orElse(Integer.MAX_VALUE);
System.out.println("Min: " + min);  // Min: 1'''),
    (36, 'Lambda for Joining Strings', '''
List<String> list = Arrays.asList("Java", "Spring", "Lambda");
String joined = list.stream()
                    .collect(Collectors.joining(", "));
System.out.println(joined);  // Java, Spring, Lambda'''),
    (37, 'Lambda with Stream MapToInt', '''
List<String> list = Arrays.asList("Java", "Spring", "Lambda");
list.stream()
    .mapToInt(String::length)
    .forEach(System.out::println);  // 4, 6, 6'''),
    (38, 'Lambda with Stream Collect to Set', '''
List<String> list = Arrays.asList("Java", "Spring", "Lambda", "Spring");
Set<String> set = list.stream()
                      .collect(Collectors.toSet());
set.forEach(System.out::println);  // Java, Spring, Lambda'''),
    (39, 'Lambda with Stream GroupingBy', '''
List<String> list = Arrays.asList("Java", "Spring", "Lambda", "Java");
Map<String, Long> frequency = list.stream()
        .collect(Collectors.groupingBy(s -> s, Collectors.counting()));
frequency.forEach((k, v) -> System.out.println(k + ": " + v));
                                       // Java: 2, Spring: 1, Lambda: 1'''),
    (40, 'Lambda with Stream PartitioningBy', '''
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
Map<Boolean, List<Integer>> partitioned = numbers.stream()
        .collect(Collectors.partitioningBy(n -> n % 2 == 0));
partitioned.forEach((k, v) -> System.out.println(k + ": " + v));
                    // true: [2, 4, 6, 8, 10], false: [1, 3, 5, 7, 9]'''),
    (41, 'Lambda with Stream Counting', '''
List<String> list = Arrays.asList("Java", "Spring", "Lambda");
long count = list.stream()
                 .collect(Collectors.counting());
System.out.println("Count: " + count);  // Count: 3'''),
    (42, 'Lambda with Stream SummarizingInt', '''
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
IntSummaryStatistics stats = numbers.stream()
        .collect(Collectors.summarizingInt(Integer::intValue));
System.out.println("Sum: " + stats.getSum());
System.out.println("Average: " + stats.getAverage());
System.out.println("Max: " + stats.getMax());
System.out.println("Min: " + stats.getMin());'''),
    (43, 'Lambda with Stream Mapping', '''
List<String> list = Arrays.asList("Java", "Spring", "Lambda");
Map<Integer, List<String>> map = list.stream()
      .collect(Collectors.groupingBy(String::length));
map.forEach((k, v) -> System.out.println(k + ": " + v));
                              // 4: [Java], 6: [Spring, Lambda]'''),
    (44, 'Lambda with Stream Joining Without Delimiter', '''
List<String> list = Arrays.asList("Java", "Spring", "Lambda");
String joined = list.stream()
                    .collect(Collectors.joining());
System.out.println(joined);  // JavaSpringLambda'''),
    (45, 'Lambda with Stream ToMap', '''
List<String> list = Arrays.asList("Java", "Spring", "Lambda");
Map<String, Integer> map = list.stream()
        .collect(Collectors.toMap(s -> s, String::length));
map.forEach((k, v) -> System.out.println(k + ": " + v));
                              // Java: 4, Spring: 6, Lambda: 6'''),
    (46, 'Lambda for Creating a Stream', '''
Stream<String> stream = Stream.of("Java", "Spring", "Lambda");
stream.forEach(System.out::println);'''),
    (47, 'Lambda with Stream Limit', '''
Stream<String> stream = Stream.of("Java", "Spring", "Lambda", "Kafka");
stream.limit(2)
      .forEach(System.out::println);  // Java, Spring'''),
    (48, 'Lambda with Stream Skip', '''
Stream<String> stream = Stream.of("Java", "Spring", "Lambda", "Kafka");
stream.skip(2)
      .forEach(System.out::println);  // Lambda, Kafka'''),
    (49, 'Lambda with Stream Peek', '''
Stream<String> stream = Stream.of("Java", "Spring", "Lambda", "Kafka");
stream.peek(System.out::println)
      .collect(Collectors.toList());'''),
    (50, 'Lambda with Optional', '''
Optional<String> optional = Optional.of("Java");
optional.ifPresent(System.out::println);  // Java'''),
]


def snippets(lo, hi):
    out = []
    for n, title, code in SNIP:
        if lo <= n <= hi:
            out.append(H(f'{n}. {title}'))
            out.append(C(code))
    return out


LAMBDA_NOTE = N('Tentang dokumen ini',
                'Walau berjudul *100 Lambda Code Snippets*, file PDF-nya hanya memuat snippet **1–50** dan nomor **33 tidak ada** '
                'di sumber (halaman langsung lompat dari 32 ke 34). Snippet 5 dan 6 memakai `println(...)` tanpa `System.out` '
                'seperti di sumber; anggap ada `import static` atau ganti dengan `System.out.println`.')
DOCS['Lambda_Code_Snippets_Java_8'] = {
    'preface': [],
    'skipped': ['SAVE IT FOR LATER', '100 LAMBDA CODE SNIPPETS', 'Java 8',
                'Comment "code" and I\'ll DM you this in PDF format'],
    'chapters': [
        {'title': 'Lambda Dasar & Functional Interface (1–18)', 'blocks': [LAMBDA_NOTE] + snippets(1, 18)},
        {'title': 'Stream API dengan Lambda (19–35)', 'blocks': snippets(19, 35)},
        {'title': 'Collectors & Operasi Stream Lanjutan (36–50)', 'blocks': snippets(36, 50)},
    ],
}

# ───────────────────────── Java Functional Interfaces (carousel) ─────────────────────────
DOCS['Java_Functional_Interfaces'] = {
    'preface': [],
    'skipped': ['Java Functional Interfaces', '@iamgnanadeep', 'SWIPE', 'CloudnLoud Community', 'REPOST IF USEFUL', 'FOLLOW FOR MORE'],
    'chapters': [{'title': 'Functional Interfaces: Konsep & Use Case', 'blocks': [
        H('01. Functional Interfaces'),
        L("Functional interfaces in Java are interfaces with a single abstract method (SAM)",
          "They are a fundamental concept in Java's functional programming paradigm and play a crucial role in Java's lambda expressions and the Stream API"),
        H('02. Use Case: Runnable and Callable'),
        P('Java provides Runnable and Callable functional interfaces for creating threads and executing tasks asynchronously'),
        C('''
Runnable runnable = () -> System.out.println("Hello, world!");
Thread thread = new Thread(runnable);
thread.start();'''),
        H('03. Use Case : Comparator'),
        P("The Comparator functional interface is used for custom sorting of objects. It's frequently used in sorting collections and arrays"),
        C('''
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.sort((name1, name2) -> name1.compareTo(name2));'''),
        H('04. Use Case : Consumer'),
        P("The Consumer functional interface represents an operation that accepts a single input and returns no result.\nIt's commonly used for actions like printing or logging."),
        C('''
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.forEach(name -> System.out.println("Hello, " + name));'''),
        H('05. Use Case : Predicate'),
        P("The Predicate functional interface represents a boolean-valued function.\nIt's often used for filtering elements."),
        C('''
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
Predicate<Integer> isEven = num -> num % 2 == 0;
List<Integer> evenNumbers = numbers.stream().filter(isEven).collect(Collectors.toList());'''),
        H('06. Use Case : UnaryOperator and BinaryOperator'),
        P('These functional interfaces are specialized forms of Function and BiFunction when the input and output types are the same.\nThey are often used for in-place transformations'),
        C('''
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
numbers.replaceAll(number -> number * 2);'''),
        H('07. Use Case : Custom Functional Interfaces'),
        P('You can create your own functional interfaces when you need to define a specific function with a well-defined signature.\n'
          'For example, you might create a functional interface for custom validation or processing logic'),
        C('''
@FunctionalInterface
interface Validator<T> {
    boolean validate(T value);
}'''),
    ]}],
}

# ───────────────────────── Lazy Loading in React (carousel) ─────────────────────────
DOCS['Lazy_Loading_React'] = {
    'preface': [],
    'skipped': ['Vladyslav Demirov', '@vladyslav-demirov', 'HAPPY CODING', 'FOLLOW ME'],
    'chapters': [{'title': 'Lazy Loading in React', 'blocks': [
        P('👉 A must-know technique to improve performance by loading components and resources only when needed.'),
        H('What is Lazy Loading?', 4),
        P('Lazy Loading is a design pattern where components or resources are loaded only when they are required, rather than at the initial load of the application.'),
        P('React provides a built-in way to implement lazy loading using the React.lazy() function.'),
        C("const LazyComponent = React.lazy(() => import('./LazyComponent'));", 'js'),
        H('Lazy Loading a Component', 4),
        P('Here’s how you can lazy load a React component with a fallback for while it’s loading:'),
        C('''
import React, { Suspense } from 'react';

const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}''', 'js'),
        N('Tip', '💡 Tip: Always wrap lazy-loaded components with Suspense to show a fallback during loading.', 'tip'),
        H('Lazy Loading with Routes', 4),
        P('For route-based lazy loading, combine React.lazy() with a router like react-router-dom.'),
        C('''
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const Home = React.lazy(() => import('./Home'));
const About = React.lazy(() => import('./About'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </Router>
  );
}''', 'js'),
        H('Preloading', 4),
        P('While lazy loading improves performance, preloading can be used to further enhance the user experience.'),
        P('Preload components when they are likely to be needed soon:'),
        C('''
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Preload
import('./LazyComponent');''', 'js'),
        P('This technique ensures the component is ready by the time the user interacts with it!'),
        H('Conclusion', 4),
        P('Use lazy loading when:'),
        L('You have components or routes that are not immediately visible to the user.',
          'Your app has large third-party libraries that can be loaded only when needed.'),
        P('Avoid lazy loading for critical components that are needed immediately on page load.'),
    ]}],
}

# ───────────────────────── Spring Dependency Injection (carousel) ─────────────────────────
DOCS['Spring_Dependency_Injection'] = {
    'preface': [],
    'skipped': ['Spring Dependency Injection', '@iamgnanadeep', 'CloudnLoud Community', 'repost if useful', 'follow for more'],
    'chapters': [{'title': 'Dependency Injection dalam Praktik', 'blocks': [
        H('#1 Dependency Injection', 4),
        L("Dependency Injection (DI) is a core concept in the Spring Framework and it's a design pattern that deals with how components obtain their dependencies",
          'In Spring, DI is implemented in a way that makes your application more modular, testable, and easier to maintain'),
        H('#2 Service Layer in a Web Application', 4),
        P('**Use Case:** When we are building a web application, and we have a service layer that handles business logic, such as user registration and authentication'),
        H('#3 Implementation', 4),
        P('We can inject a UserService into UserController. This allows for easy testing of the controller by substituting a mock UserService during testing.'),
        C('''
@Controller
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ...
}'''),
        H('#4 Data Access Layer with Repository Pattern', 4),
        P('**Use Case:** We are developing a data access layer for interacting with a database, and We want to implement the repository pattern.'),
        H('#5 Implementation', 4),
        P('We can inject a UserRepository into UserService for database operations.'),
        C('''
@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ...
}'''),
        H('#6 Testing with Dependency Injection', 4),
        P('**Use Case:** We want to write unit tests for your components without making actual external calls or database connections.'),
        H('#7 Implementation', 4),
        P('We can use @MockBean to replace actual components with mocks.'),
        C('''
@SpringBootTest
public class MyServiceTest {
    @Autowired
    private MyService myService;

    @MockBean
    private MyRepository myRepository;

    // ...
}'''),
        H('#8 External Configuration', 4),
        P('**Use Case:** We want to configure your application with external properties, such as database connection details'),
        H('#9 Implementation', 4),
        P("Spring's @Value annotation allows you to inject properties from configuration files or environment variables into your components."),
        C('''
@Service
public class DatabaseService {
    @Value("${database.url}")
    private String databaseUrl;

    // ...
}'''),
    ]}],
}

# ───────────────────────── Data Structure (catatan tulisan tangan, Atul Kumar) ─────────────────────────
DOCS['Data_Structure'] = {
    'preface': [],
    'skipped': ['ATUL KUMAR (LINKEDIN)'],
    'chapters': [{'title': 'Catatan Ringkas Struktur Data', 'blocks': [
        N('Tentang catatan ini', 'Disalin dari catatan tulisan tangan *Data Structure* (Atul Kumar, 8 halaman). '
          'Ejaan yang keliru di tulisan tangan dirapikan; diagram digambar ulang sebagai teks.'),
        H('What is Data Structure?'),
        P('Data can be arranged in a many ways, logical or mathematical arrangement of a data is called Data structure.'),
        P('**Examples:** Array, linkedlist, stack, Queue, Tree, Graph and many more.'),
        H('What is an Algorithms?'),
        P('Sequence of steps performed on the data using efficient data structures to solve a given problem.'),
        P('**Example:** Sorting an Array.'),
        H('Classification of Data Structure'),
        C('''
DATA STRUCTURE
├── Primitive (int, float, string)
└── Non-Primitive
    ├── Linear
    │   ├── Static  → Array
    │   └── Dynamic → Linked List, Stack, Queue
    └── Non-Linear
        ├── Tree
        └── Graph''', 'text'),
        H('Types of Data Structures'),
        L('Primitive and Non-Primitive Data structure.', 'Static and Dynamic Data structure.',
          'Persistent and ephemeral Data structure.', ordered=True),
        P('**Non-Primitive further Divided into two Types.**'),
        L('Linear Data Structure.', 'Non-Linear Data Structure.', ordered=True),
        P('**Persistent further Divided into three types.**'),
        L('Partially Persistent.', 'Fully Persistent.', 'Confluently Persistent.', ordered=True),
        H('Data Structure Operations'),
        P('The following four operations play a major role.'),
        T(['Operasi', 'Penjelasan'], [
            ['Traversing', 'Accessing each record exactly once so that certain items in the record may be processed.'],
            ['Searching', 'Finding the location of the record with a given key value.'],
            ['Inserting', 'Adding a new record to the structure.'],
            ['Deleting', 'Removing a record from the structure.'],
            ['Merging', 'Combining the records in two different sorted files into a single sorted file.'],
            ['Sorting', 'Arranging the record in some logical order. Example: Alphabetically according to some NAME key or in Numerical order according to some NUMBER key.'],
        ]),
        H('Searching Algorithms'),
        P('A search algorithm is a step-by-step procedure using to locate specific data among collection of data.'),
        H('Types of search algorithms with the complexity', 4),
        P('**1) Linear Search:** A linear search or sequential search is a method for finding an element within a list. It sequentially checks each element of the list until a match is found or the whole list has been searched.'),
        C('C(n) = n/2   ← Complexity of linear search', 'text'),
        P('**2) Binary Search:** In Binary search approach the element is always searched in the middle of a portion of an array. Binary search can be implemented only on a sorted list of items. If the elements are not sorted already, we need to sort them first.'),
        C('C(n) = log2 n   ← Complexity of Binary search', 'text'),
        H('Array'),
        P('Array is a type of linear Data structure **OR** Array is a collection of more than one data but all the data items are same data types, & stored that data in a computer in a contiguous memory location.'),
        C('''
...... |   | 1 | 2 | 3 | 4 | 5 |   |   |   | ......
       └─┘
     1 Byte = 8 bit''', 'text'),
        P('**Memory** is a long tape of Bytes.'),
        H('Types of Array', 4),
        P('**1) One Dimensional Array:** The array with only one subscript, that array is called as One Dimensional Array. Example: `int a[5];` ← subscript.'),
        P('**2) Two Dimensional Array:** The array with two subscript, that array is called as Two Dimensional Array. Example: `int a[5][5];` ← subscript.'),
        P('**3) Multi-Dimensional Array:** The array with more than two subscript, that array is called as Multi-Dimensional Array.'),
        H('Linked List'),
        P('**Linked list** is a linear Data structure. It is also a collection of more than one data items of a dissimilar data type like array, but it cannot be stored in contiguous memory location. It can be stored randomly in a main memory.'),
        P('So that linked list contains two parts: one for **Data** and second part for the **Address** of the next data element.'),
        C('[ Data element | Address ] ──►', 'text'),
        H('Types of linked list', 4),
        C('''
1) Singly linked list
   [ 7 | 300 ] ───► [ 8 | Null ]
      200              300

2) Doubly linked list
   [   | 2 | 200 ] ◄──► [ 100 | 3 | NULL ]
         100                  200

3) Circular linked list
   ┌─► [ 2 | 200 ] ───► [ 3 | 300 ] ───► [ 4 | 100 ] ─┐
   │      100              200              300       │
   └──────────────────────────────────────────────────┘

4) Doubly circular linked list
   ┌─► [ 100 | 2 ] ◄──► [ 200 | 3 ] ◄──► [ 300 | 1 ] ─┐
   │        1                 2                 3      │
   └───────────────────────────────────────────────────┘''', 'text'),
        H('Stacks'),
        P('A stack is a list of elements in which an element may be inserted or deleted only at one end called the **TOP** of the stack. (Gambar: *stack of dishes* — tumpukan piring.)'),
        L('**Push** → Insert elements into stack', '**Pop** → Delete elements from stack'),
        H('Queues'),
        P('A **Queue** is a linear list of elements in which deletions can take place only at one end called **front** and insertions can take place only at the other end called the **rear**. (Gambar: antrean orang di halte bus — *Bus Stop*.)'),
        H('Trees'),
        P('Trees are non-linear data structure where data are stored or data containing a hierarchical relationship b/w elements.'),
        P('A binary tree T is defined as a finite set of elements called nodes.'),
        C('''
            A
          /   \\
         B     C
        / \\   / \\
       D   E G   H
           |    / \\
           F   J   K
               |
               L''', 'text'),
        H('Traversing Binary Trees', 4),
        P('There are three ways of traversing a binary tree T with root R.'),
        T(['Preorder', 'Inorder', 'Postorder'], [
            ['1) Process the root R', '1) Traverse left subtree', '1) Traverse left subtree'],
            ['2) Traverse the left subtree of R in Preorder', '2) Process the root R', '2) Traverse Right subtree'],
            ['3) Traverse the Right subtree in preorder', '3) Traverse Right subtree', '3) Process the root R'],
        ]),
        H('Graph'),
        P('**Graph** is a collection of two set **V** and **E** where, V → Vertices/Nodes, E → Edges.'),
        P('Graph is a mathematical structure that represents pair-wise relationship between objects where nodes are connected with edges.'),
        L('**Vertex** → Vertex is nothing but the data element which is also known as Nodes',
          '**Edge** → Edge is a connection link between two vertices'),
        C('''
A ───────► B
│           ╲
▼            ▼
C ───► D ──► E
       ↺ (D punya loop ke dirinya sendiri)''', 'text'),
        H('Representation of the graph', 4),
        L('Adjacency Matrix', 'Adjacency List', ordered=True),
    ]}],
}


def IMG(src, alt, caption=None):
    b = {'type': 'image', 'src': src, 'alt': alt}
    if caption:
        b['caption'] = caption
    return b


# ───────────────────────── TDD (carousel Dicoding, 4 slide gambar) ─────────────────────────
DOCS['TDD'] = {
    'preface': [],
    'skipped': ['dicoding', 'www.dicoding.com', 'Udah kebayang cara kerja TDD untuk vibe coding?',
                'Kalau belum, ini saatnya belajar di Dicoding.', 'Kamu bakal diajarin bikin clean code,',
                'arsitektur kode rapi,', 'dan prompting khusus untuk software engineering!',
                'Daftar kelasnya sekarang di dicoding.com'],
    'chapters': [{'title': 'TDD untuk Vibe Coding', 'blocks': [
        H('Dosa Berulang Vibe Coding'),
        L('Langsung **Deploy** Tanpa **Testing**,', 'Fitur lama jadi **nge-bug** karena "kesenggol"'),
        P('Cara ngatasinnya? **Pake TDD!**'),
        H('Test-drive Development (TDD)'),
        P('Pendekatan saat kamu wajib bikin **skenario pengujian (unit testing)** sebelum menulis fungsinya.'),
        N('Jadi, analoginya dibalik!', 'Bukan bikin kode dulu baru dites, tapi kamu tulis dulu **skenario pengujian (unit test)**, baru buat kodenya.'),
        C("""
TEST FIRST
  ✓ Test Case 1
  ✓ Test Case 2
  ✓ Test Case 3
  ✓ Test Case n
        ↓
THEN CODE   </>""", 'text'),
        H('Cara Kerja TDD untuk Vibe Coding'),
        P('Siklus di diagram: **1. Start** → *Feature Requirements* → **2. Write Test** → *Test Fail* (**RED**) → '
          '**3. Write Code** → *Test Passed* (**GREEN**) → **4. Clean Code** (**REFACTOR**) → **5. Iterate**, kembali ke awal. '
          'Di tengahnya: *Test-Driven Development (TDD)*.'),
        L('Minta AI untuk tulis test tiap ada fitur baru.',
          'Pastikan semua test sudah hijau sebelum kamu commit.',
          'Minta AI untuk refactor atau rapihin kodenya.',
          'Tes ulang kode tersebut.',
          'Done!', ordered=True),
    ]}],
}

# ───────────────────────── FSD dan TSD (carousel Muhammad Afif, 11 slide gambar) ─────────────────────────
DOCS['FSD_dan_TSD'] = {
    'preface': [],
    'skipped': ['Muhammad Afif - Creative Writer', 'Halo, saya Afif,', 'Creative Writer Enthusiast', 'Kindly check my profile!'],
    'chapters': [{'title': 'FSD dan TSD: Dokumen Spesifikasi Software', 'blocks': [
        P('**FSD dan TSD** kalau analogi nya **mobil**.'),
        P('Di **Technical Writer**, ada yang namanya **FSD** dan **TSD**.'),
        P('**FSD** dan **TSD** adalah sebuah **dokumen yang diperlukan saat merancang software atau alat**.'),
        P('Aplikasi yang kita pakai, kipas angin, mobil yang kita pakai atau yang lain, pakai dua jenis dokumen di atas.'),
        H('FSD (Functional Specification Document)'),
        P('Dokumen yang isinya: **"Kalo mau bikin sistem atau alat, apa aja kegunaan dan fungsinya?"**'),
        H('TSD (Technical Specification Document)'),
        P('Dokumen yang isinya: **"Sistem atau alat yang mau dibikin, pakai teknologi yang seperti apa? desainnya seperti apa?"**'),
        H('Bayangin kita mau bikin mobil'),
        P('**Kira-kira FSD dan TSD nya seperti ini:**'),
        T(['FSD — fokusnya pada **fungsi**', 'TSD — fokusnya pada **teknis**'], [
            ['Mobil ini bisa dinaiki 7 penumpang.', 'Mobil ini mempunyai sistem bahan bakar injeksi dengan efisiensi 15km/liter.'],
            ['Mobil ini ada fitur sun-roof.', 'Mobil memiliki sistem penggerak FWD (Front Wheel Drive)'],
            ['Mobil ini mempunyai transimisi automatic.', 'Mobil ini memiliki sistem audio Bluetooth 5.0 dan amplifier digital.'],
        ]),
        H('Hubungan antara FSD dan TSD'),
        L('**FSD:** Apa yang harus ada di mobil dalam **perspektif pengguna.**',
          '**TSD:** Bagaimana fitur atau fungsi itu **diimplementasikan.**'),
        N('Lalu bayangkan…', 'Kalau bikin mobil **nggak ada FSD dan TSD....**', 'warn'),
    ]}],
}

# ───────────────────────── 60 days of Java — Day 2 (carousel Hariprasath V) ─────────────────────────
DOCS['60_days_Java'] = {
    'preface': [],
    'skipped': ['60 days of java from 0 to Hero series', 'Hariprasath V', 'Give Like content is helpful',
                'Click below link to follow on linkedIn :', 'https://www.linkedin.com/in/hariprasathv6/',
                'Follow me on linked in get daily tech contents', 'if you want others also learn and grow together',
                'Tangkapan layar profil LinkedIn (slide 11): HARIPRASATH V — Java | SpringBoot | Microservices | Kafka | React.js | Python; '
                'Java Full Stack Developer | Spring Boot | Microservices | Kafka | React Js | AWS | Data Structures and Algorithms | '
                'Javascript | Python; Anna University Chennai; Chennai, Tamil Nadu, India - Contact info; Add verification badge; '
                '#OPENTOWORK; + Follow; REPOST'],
    'chapters': [{'title': 'Day 2: JDK, JRE, JVM & JIT', 'blocks': [
        P('*60 days of java from 0 to Hero series* — **Day 2: JDK, JRE, JVM** (Hariprasath V).'),
        H('What is JDK?'),
        L('JDK Stands for Java Development Kit.',
          'Its a kind of kit it have all the required thing to develop,modify,running java code.',
          'Its contain JRE and developer tools.'),
        H('What is developer tools?', 4),
        L('Developer tools is nothing while developing code it will helpfull for us.',
          'These tools we can also call its as softwares.'),
        H('Tools Types', 4),
        T(['Tool', 'Keterangan'], [
            ['1. javac – Java Compiler', 'It will do the first step compilation converting source code .java file to byte code .class file'],
            ['2. java – Java Runtime Launcher', 'Runs Java applications, executing compiled bytecode (.class files).'],
            ['3. javadoc - Documentation generator', 'Generates HTML documentation from Java source code comments.'],
            ['4. jar - Archive tool', 'Packages Javaclasses,metadata and resources into single .jar file (java archive)'],
            ['5. jconsole - Java Monitoring & Management Console', 'Monitors and manages Java applications in real time.'],
            ['6. javap – Disassembler', 'Disassembles class files to show the bytecode, helping developers inspect class structures.'],
            ['7. jdb - Java Debugger', 'A Command line debugger helps in debugging java programms. etc tools available in JDK'],
        ]),
        H('What is JRE?'),
        L('JRE stands for **Java Runtime Environment**',
          'It provides a environment to run our application.',
          'JRE contains JVM and Libraries jar file to run our program code.'),
        H('What is Libraries?', 4),
        L('Libraries contain collection of .class files.',
          'What are things need to run our code everything is preprogrammed or inbuilt in the libraries.',
          'We can use them to save our time .'),
        P('**For example:** If want doing math operations like min,max values — Inbuild libraries. math,io,lang.util etc'),
        P('**Other files** — Java Runtime Environment (JRE) Tools: java,javaw,jre/bin · Java plugin,security manager etc'),
        H('What is JVM?'),
        L('JVM stands for **Java Virtual machine.**',
          'Its providing a virtual machine where our application code will run.',
          'JVM is not existing physically.',
          'JVM contains JIT and some other tools.',
          'JVM will convert byte code .class file into low level native machine code (binary code 0 and 1) using JIT interpreter.'),
        P('**Other Components inside the JVM:** Class Loader Subsystem,Runtime Data Areas · Execution Engine,Native Interface (JNI) · '
          'Garbage Collector (GC),Execution Threads — we will see much more details seperately future'),
        H('What is JIT?'),
        L('JIT stands for **Just In Time**',
          'It‘s a interpreter converting code line by line from byte code to low level machine code.',
          'JIT is improving our performance.'),
        P('**Example:** We are Using loop it will execute 100 times or more.'),
        H('What Happens Without JIT (Interpretation)?', 4),
        L('When the program first runs, the JVM interprets the bytecode line by line.',
          'For every iteration of the loop, it’s translating the bytecode into machine code one-by-one, which is slower.',
          'we need to use JIT improves performance.'),
        H('How JIT Improving performance?', 4),
        L('**Initial Execution:** The JVM runs the program normally, interpreting the bytecode at first (like in our example). So, when the loop starts, it gets interpreted line by line.',
          '**Hot Spot Detection:** As the loop runs and the JVM notices the loop is being executed many times (100 times, or maybe more), it marks that loop as a "hot spot." This means the loop is important because it\'s running a lot.',
          '**JIT Compilation (On-the-Fly):** Instead of interpreting the loop every time it runs, the JVM compiles the loop into optimized machine code just once when it identifies it’s being used a lot. This is the "on-the-fly" part',
          '**Reuse:** After JIT compiles it once, the JVM remembers this optimized version of the loop. The next time the loop runs, it doesn’t have to interpret it again. It just uses the optimized, compiled machine code.',
          'This makes the loop run much faster because the compilation work has already been done.'),
        H('Java Code', 4),
        C("""
class Main{
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}"""),
        H('When run java code what happen?'),
        L('Whennever we are writing java code its a high level language machine can\'t able to understand language',
          'we need to convert highlevel language into low level language machine code',
          'In this transformation we will tell as compilation(translation)'),
        H('Two compilation', 4),
        P('**First Step compilation:**'),
        L('First compilation process taken by compiler its inside the JDK.',
          'compiler will check any syntax,error occurred for developer written code.',
          'It will convert source code .java file to byte code .class file'),
        P('**Second Step compilation:**'),
        L('JVM will covert Byte code into low level language (machine code) Its 0 and 1.'),
        N('Note', 'JDK is platform independent but JRE is platform dependent how? If want to know full explanation about two questions comment “two question” i will create seperate post'),
    ]}],
}

# ───────────────────────── Exploring the Java Ecosystem (carousel BenMoussa FaYssal) ─────────────────────────
ECO = [
    ('Frameworks', [
        ('Spring Framework', 'For building enterprise-level applications.'),
        ('Spring Boot', 'Simplifies Spring-based application development.'),
        ('Hibernate', 'For Object-Relational Mapping (ORM).'),
        ('Jakarta EE (Java EE)', 'Enterprise Edition for large-scale applications.'),
        ('Apache Struts', 'For building MVC-based web applications.'),
        ('Grails', 'A Groovy-based framework for Java developers.'),
        ('Micronaut', 'Lightweight framework for microservices and serverless apps.'),
        ('Quarkus', 'Optimized for Kubernetes and cloud-native development.')]),
    ('Build Tools', [
        ('Maven', 'Dependency management and build tool.'),
        ('Gradle', 'Build automation tool for multi-language projects.'),
        ('Ant', 'XML-based build tool.')]),
    ('Web Development', [
        ('Servlets & JSP', 'For building dynamic web pages.'),
        ('Thymeleaf', 'Modern server-side template engine.'),
        ('Vaadin', 'Framework for building modern web applications.'),
        ('JSF (JavaServer Faces)', 'Component-based UI framework.')]),
    ('Testing', [
        ('JUnit', 'Unit testing framework.'),
        ('TestNG', 'Advanced testing framework.'),
        ('Mockito', 'Mocking framework for testing dependencies.'),
        ('Cucumber', 'Behavior-driven development (BDD).'),
        ('Selenium', 'Browser-based testing framework.')]),
    ('Persistence & Databases', [
        ('JPA (Java Persistence API)', 'ORM standard for database integration.'),
        ('MyBatis', 'For custom SQL queries and ORM.'),
        ('JDBC', 'Standard Java API for database connectivity.')]),
    ('Logging', [
        ('SLF4J', 'Logging facade for different implementations.'),
        ('Log4j', 'Advanced logging framework.'),
        ('Logback', 'Logging framework with better performance.')]),
    ('Security', [
        ('Spring Security', 'Comprehensive security framework.'),
        ('Apache Shiro', 'General-purpose security framework.'),
        ('Keycloak', 'Identity and access management solution.')]),
    ('Messaging', [
        ('JMS (Java Message Service)', 'Messaging standard for communication between systems.'),
        ('RabbitMQ Java Client', 'For RabbitMQ integration.'),
        ('Apache Kafka (Java API)', 'Distributed streaming platform.')]),
    ('RESTful & Web Services', [
        ('JAX-RS', 'API for building RESTful web services.'),
        ('OpenAPI', 'API documentation and testing tool.'),
        ('Swagger', 'API documentation and testing tool.')]),
    ('Development Tools', [
        ('Eclipse IDE', 'Popular integrated development environment for Java.'),
        ('IntelliJ IDEA', 'Advanced IDE for Java development.'),
        ('NetBeans', 'Java development IDE.'),
        ('Visual Studio Code', 'Lightweight editor with Java extensions.')]),
    ('AI & Machine Learning', [
        ('Deeplearning4j', 'Deep learning library for Java.'),
        ('Weka', 'Machine learning library.'),
        ('Apache Mahout', 'Scalable machine learning algorithms.')]),
    ('Concurrency & Parallelism', [
        ('Akka', 'Actor-based concurrency library.'),
        ('RxJava', 'For reactive programming.'),
        ('Project Loom', 'Lightweight threads and continuations.')]),
    ('Networking', [
        ('Netty', 'Asynchronous networking library.'),
        ('Grizzly', 'NIO framework for building web servers.'),
        ('Apache MINA', 'Network application framework.')]),
    ('Utilities', [
        ('Apache Commons', 'A collection of reusable Java components for various tasks.'),
        ('Guava', "Google's utility library for Java, including collections, caching, and more."),
        ('Jackson', 'A JSON data-binding library for Java.'),
        ('Gson', 'A library for converting Java objects to and from JSON.'),
        ('Joda-Time', 'Library for better date and time management in Java.'),
        ('Apache POI', 'For reading and writing Microsoft Office documents.'),
        ('JSoup', 'Library for parsing and manipulating HTML.'),
        ('Apache PDFBox', 'For creating, reading, and editing PDF documents.'),
        ('ZXing (Zebra Crossing)', 'A barcode and QR code scanning library for Java.'),
        ('Google Truth', 'Library for writing readable and easy-to-maintain test assertions.'),
        ('FasterXML', 'High-performance serialization/deserialization library.'),
        ('Apache Lucene', 'A powerful search engine library for full-text search.'),
        ('SnakeYAML', 'For working with YAML configurations in Java.'),
        ('JavaFX', 'Toolkit for building rich client applications.'),
        ('OpenCSV', 'For reading and writing CSV files in Java.')]),
]
_eco = [P('*Exploring the Java Ecosystem — Frameworks, Tools, and Technologies for Modern Development* (BenMoussa FaYssal). '
          'Peta singkat teknologi di ekosistem Java, dikelompokkan per kebutuhan.')]
for _cat, _rows in ECO:
    _eco += [H(_cat), T(['Technology', 'Description'], [[a, b] for a, b in _rows])]
_eco.append(P('*Thank You for Exploring the Java Ecosystem with Us!* How many of these tools and technologies have you used so far? '
              'Share your experience, favorite tools, or any other technologies you think should be included in the Java ecosystem!'))
DOCS['Exploring_the_Java_Ecosystem'] = {
    'preface': [],
    'skipped': ['Exploring the', 'Java Ecosystem', 'BenMoussa FaYssal', '... ....'],
    'chapters': [{'title': 'Peta Ekosistem Java: Framework, Tools & Library', 'blocks': _eco}],
}

# ───────────────────────── Microservices Design Patterns (carousel Hina Arora) ─────────────────────────
MSP = [
    (2, 'Gateway Pattern', 'Use an API Gateway to handle client requests and route them to the appropriate microservices. This centralized authentication, load balancing, and routing logic.',
     'Client Mobile app / Client Web App → API Gateway (Security, Routing, Logging, Rate Limiting, Aggregation) → Students / Courses / Payments Microservice'),
    (3, 'Service Registry Pattern', 'Implement a service registry to automatically locate and register microservices. This helps in dynamic discovery and communication between services.',
     'Service instance + Registry-aware HTTP Client → Service Registry ← Registry Client di tiap instance (REST API, 10.4.3.x)'),
    (4, 'Circuit Breaker Pattern', 'Prevent cascading failures by using a circuit breaker that can temporarily stop requests to a failing service and provide fallback mechanisms.',
     'Uploader → N+ (load balancer) → Resizer 1/2/3 dengan health check; Resizer yang gagal diputus'),
    (5, 'Saga Pattern', 'Manage long-lived transactions across multiple microservices by breaking them down into a sequence of smaller, local transactions.',
     'Client Request → Message broker → Service A / Service B / Service C'),
    (6, 'CQRS Pattern', 'Separate the read and write responsibilities of a system, allowing for optimized performance and scalability.',
     'UI → Command Service (Command Model) → Writes → Storage → Reads → Query Service (Query Model) → UI'),
    (7, 'Bulkhead Pattern', 'Isolate failures within separate sections to prevent them from affecting the entire system.',
     'Load Balancer → Virtual Gateway → Virtual Router; POST /price → price-write-node, GET /price → price-read-node (circuit breaker), deployment write & read terpisah'),
    (8, 'Sidecar Pattern', 'Attach a separate microservice (sidecar) to handle specific tasks like monitoring, logging, or authentication.',
     'Motor dengan sespan: Microservice = motor; Sidecar = peripheral components like logging, configuration, etc.'),
    (9, 'API Composition Pattern', 'Combine multiple microservices to create a more complex and feature-rich API for clients.',
     'query() → API Composer → queryA() / queryB() / queryC() → Provider Service A / B / C'),
    (10, 'Event-Driven Architecture Pattern', 'Communicate between microservices through events, enabling loose coupling and scalability.',
     'Customer Order UI → event bus (Send current location, Allocate nearest taxi, Taxi order event) → Taxi Car Service, Taxi Fleet Service; ETA notification kembali ke UI'),
    (11, 'Database per Service Pattern', 'Each microservice has its own dedicated database to ensure loose coupling and autonomy.',
     'Movie Service, Customer Service, Review Service — masing-masing dengan database sendiri'),
    (12, 'Retry Pattern', 'Automatically retry failed operations to improve the chances of success.',
     'user homepage service → Request → Error → Retry Request → Success ← user recommendation service'),
    (13, 'Configuration Externalization Pattern', 'Store configuration settings outside the codebase for easier management and updates.',
     'Admin Manages configuration → Externalized Configuration Store; Service 1 & Service 2 get configuration at live'),
    (14, 'Strangler Fig Pattern', 'Gradually replace components of a legacy system with new ones until the old system is "strangled" and replaced entirely.',
     'Client → Proxy → Monolith (A, B, C) / Service A; Change Data Capture (CDC) → Event Source + Sink Connectors → Stream (Reads/Writes); Service A fully replaces module A'),
    (15, 'Leader Election Pattern', 'Designate a leader among instances of a microservice for tasks like coordination and decision-making.',
     'request → Microservice A (leader), B, C, D → task results → aggregated result'),
]
_msp = [P('*Microservices Design Patterns for Designing and Implementing Microservices* (Hina Arora): 14 pola dalam satu halaman, '
          'masing-masing dengan diagram aslinya. Pembahasan lengkap tiap pola ada di modul-modul Distributed System.'),
        L(*[t for _, t, _, _ in MSP], ordered=True)]
for _pg, _t, _d, _lbl in MSP:
    _msp.append(H(_t))
    _msp.append(P(_d))
    _msp.append(IMG(f'media/microservices-patterns/p{_pg:02d}.webp', f'Diagram {_t}', f'Slide asli: {_t}.'))
    if _lbl:
        _msp.append(P(f'*Isi diagram:* {_lbl}'))
DOCS['Microservices_Design_Pattern'] = {
    'preface': [],
    'skipped': ['Hina Arora', 'Microservices', 'Design Patterns', 'for', 'Designing and Implementing', 'For More'],
    'chapters': [{'title': '14 Microservices Design Patterns (Ringkasan Visual)', 'blocks': _msp}],
}


if __name__ == '__main__':
    out = os.path.join(sys.argv[1], 'manual')
    os.makedirs(out, exist_ok=True)
    for name, d in DOCS.items():
        json.dump({**d, 'raw': []}, open(os.path.join(out, name + '.json'), 'w'), ensure_ascii=False, indent=1)
        print('ok', name, len(d['chapters']))
