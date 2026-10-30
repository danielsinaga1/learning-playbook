import type { ReactNode } from 'react';
import type { CodeLang } from '../types';

type Rule = [cls: string, re: RegExp];

const kw = (words: string) => new RegExp(`\\b(?:${words})\\b`, 'y');

const SLASH_CMT: Rule = ['cmt', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y];
const HASH_CMT: Rule = ['cmt', /#[^\n]*/y];
const DQ_STR: Rule = ['str', /"(?:\\.|[^"\\\n])*"/y];
const SQ_STR: Rule = ['str', /'(?:\\.|[^'\\\n])*'/y];
const BT_STR: Rule = ['str', /`(?:\\.|[^`\\])*`/y];
const NUM: Rule = ['num', /\b(?:0x[\da-fA-F]+|\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?)[LlFfDdn]?\b/y];
const TYPE: Rule = ['type', /\b[A-Z][A-Za-z0-9_]*\b/y];
const FN: Rule = ['fn', /\b[a-z_$][\w$]*(?=\s*\()/y];
const ANN: Rule = ['ann', /@[A-Za-z_][\w.]*/y];

const JAVA_KW =
  'abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|record|return|sealed|permits|short|static|super|switch|synchronized|this|throw|throws|transient|try|var|void|volatile|while|yield|null|true|false';
const GO_KW =
  'break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var|nil|true|false|iota|any|error|string|int|int8|int16|int32|int64|uint|uint8|uint16|uint32|uint64|float32|float64|bool|byte|rune|make|new|len|cap|append|copy|delete|panic|recover|close';
const TS_KW =
  'abstract|any|as|async|await|boolean|break|case|catch|class|const|constructor|continue|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|infer|instanceof|interface|keyof|let|module|namespace|never|new|null|number|object|of|private|protected|public|readonly|return|satisfies|set|static|string|super|switch|symbol|this|throw|true|try|type|typeof|undefined|unique|unknown|var|void|while|yield';
const PY_KW =
  'and|as|assert|async|await|break|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield|self|match|case';
const DART_KW =
  'abstract|as|assert|async|await|base|break|case|catch|class|const|continue|covariant|default|deferred|do|dynamic|else|enum|export|extends|extension|external|factory|false|final|finally|for|get|if|implements|import|in|interface|is|late|library|mixin|new|null|on|operator|part|required|rethrow|return|sealed|set|show|static|super|switch|sync|this|throw|true|try|typedef|var|void|when|while|with|yield|int|double|bool|num|String';
const RUST_KW =
  'as|async|await|break|const|continue|crate|dyn|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|true|type|unsafe|use|where|while|i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|bool|char|str|String|Vec|Option|Result|Some|None|Ok|Err';
const SQL_KW =
  'select|from|where|and|or|not|insert|into|values|update|set|delete|create|table|index|unique|primary|key|foreign|references|on|join|left|right|inner|outer|group|by|order|having|limit|offset|as|distinct|count|sum|avg|min|max|null|default|alter|add|drop|if|exists|begin|commit|rollback|returning|serial|integer|int|bigint|varchar|text|boolean|timestamp|numeric|decimal|with|case|when|then|else|end|in|is|like|asc|desc|cascade|constraint|check';

const C_KW =
  'auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|bool|true|false|NULL';
const CPP_KW =
  C_KW +
  '|class|public|private|protected|virtual|override|template|typename|namespace|using|new|delete|this|nullptr|try|catch|throw|operator|friend|const_cast|static_cast|dynamic_cast|reinterpret_cast|auto|constexpr|noexcept|explicit|mutable|std|vector|string|pair|map|set|queue|stack|priority_queue|cout|cin|endl';
const CS_KW =
  'abstract|as|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|var|virtual|void|volatile|while';
const KT_KW =
  'abstract|actual|annotation|as|break|by|catch|class|companion|const|constructor|continue|crossinline|data|do|else|enum|expect|external|false|final|finally|for|fun|get|if|import|in|infix|init|inline|inner|interface|internal|is|lateinit|noinline|null|object|open|operator|out|override|package|private|protected|public|reified|return|sealed|set|super|suspend|tailrec|this|throw|true|try|typealias|val|value|var|vararg|when|where|while';
const PHP_KW =
  'abstract|and|array|as|break|case|catch|class|clone|const|continue|declare|default|do|echo|else|elseif|empty|endfor|endforeach|endif|endwhile|extends|final|for|foreach|function|global|if|implements|include|instanceof|interface|isset|list|new|or|print|private|protected|public|require|return|static|switch|throw|try|unset|use|var|while|true|false|null';
const PREPROC: Rule = ['ann', /#\s*(?:include|define|ifndef|ifdef|endif|pragma|undef|if|else)\b[^\n]*/y];

const RULES: Record<CodeLang, Rule[]> = {
  cpp: [SLASH_CMT, PREPROC, DQ_STR, SQ_STR, ['kw', kw(CPP_KW)], NUM, TYPE, FN],
  c: [SLASH_CMT, PREPROC, DQ_STR, SQ_STR, ['kw', kw(C_KW)], NUM, TYPE, FN],
  csharp: [SLASH_CMT, DQ_STR, SQ_STR, ['kw', kw(CS_KW)], NUM, TYPE, FN],
  php: [SLASH_CMT, HASH_CMT, DQ_STR, SQ_STR, ['ann', /<\?php|\?>/y], ['num', /\$[A-Za-z_]\w*/y], ['kw', kw(PHP_KW)], NUM, FN],
  kotlin: [SLASH_CMT, ['str', /"""[\s\S]*?"""/y], DQ_STR, SQ_STR, ANN, ['kw', kw(KT_KW)], NUM, TYPE, FN],
  java: [SLASH_CMT, DQ_STR, SQ_STR, ANN, ['kw', kw(JAVA_KW)], NUM, TYPE, FN],
  go: [SLASH_CMT, DQ_STR, BT_STR, SQ_STR, ['kw', kw(GO_KW)], NUM, TYPE, FN],
  ts: [SLASH_CMT, BT_STR, DQ_STR, SQ_STR, ANN, ['kw', kw(TS_KW)], NUM, TYPE, FN],
  js: [SLASH_CMT, BT_STR, DQ_STR, SQ_STR, ['kw', kw(TS_KW)], NUM, TYPE, FN],
  dart: [SLASH_CMT, ['str', /'''[\s\S]*?'''|"""[\s\S]*?"""/y], DQ_STR, SQ_STR, ANN, ['kw', kw(DART_KW)], NUM, TYPE, FN],
  python: [
    HASH_CMT,
    ['str', /[rfbu]{0,2}("""[\s\S]*?"""|'''[\s\S]*?''')/y],
    ['str', /[rfbu]{0,2}("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/y],
    ANN,
    ['kw', kw(PY_KW)],
    NUM,
    TYPE,
    FN,
  ],
  bash: [
    HASH_CMT,
    DQ_STR,
    ['str', /'[^']*'/y],
    ['kw', /(?<=^|\n|&&\s|\|\s|;\s|\$\(|sudo\s)\s*(?:aws|mvn|\.\/mvnw|\.\/gradlew|gradle|docker|docker-compose|kubectl|minikube|helm|git|go|java|npm|npx|pnpm|yarn|node|pip3?|python3?|uvicorn|gunicorn|celery|alembic|django-admin|curl|cd|mkdir|cp|mv|rm|ls|cat|echo|export|flutter|dart|ng|protoc|brew|apt|apt-get|sudo|chmod|wget|grpcurl|golangci-lint|cargo|rustup|dotnet|kotlinc?|uv|pytest|ruff|tsc|grep|sed|awk|find|xargs|sort|uniq|wc|head|tail|cut|tr|tee|ssh|scp|chown|ps|kill|source|trap|jq|touch|diff)\b/y],
    ['flag', /(?<=\s)-{1,2}[A-Za-z][\w-]*/y],
    ['num', /\$\{?[A-Za-z_]\w*\}?/y],
  ],
  docker: [
    HASH_CMT,
    DQ_STR,
    ['kw', /(?<=^|\n)\s*(?:FROM|RUN|COPY|ADD|CMD|ENTRYPOINT|WORKDIR|EXPOSE|ENV|ARG|USER|VOLUME|LABEL|HEALTHCHECK|SHELL|STOPSIGNAL|ONBUILD)\b/iy],
    ['type', /\bAS\b/y],
    ['flag', /(?<=\s)--[\w-]+(=\S+)?/y],
  ],
  yaml: [
    HASH_CMT,
    ['key', /(?<=^|\n)[ \t-]*[\w.\-/"']+(?=\s*:(\s|$))/y],
    DQ_STR,
    SQ_STR,
    ['kw', /\b(?:true|false|null|yes|no)\b/y],
    NUM,
  ],
  json: [['key', /"(?:\\.|[^"\\])*"(?=\s*:)/y], DQ_STR, ['kw', /\b(?:true|false|null)\b/y], NUM],
  sql: [['cmt', /--[^\n]*/y], SQ_STR, DQ_STR, ['kw', new RegExp(`\\b(?:${SQL_KW})\\b`, 'iy')], NUM],
  graphql: [
    HASH_CMT,
    DQ_STR,
    ['kw', kw('type|query|mutation|subscription|input|enum|interface|union|scalar|schema|extend|implements|fragment|on|directive|true|false|null')],
    ['ann', /[@$][A-Za-z_]\w*/y],
    TYPE,
  ],
  rust: [SLASH_CMT, DQ_STR, ['str', /'(?:\\.|[^'\\\n])'/y], ['fn', /\b[a-z_]\w*!/y], ['ann', /#!?\[[^\]]*\]/y], ['kw', kw(RUST_KW)], NUM, TYPE, FN],
  hcl: [HASH_CMT, ['cmt', /\/\/[^\n]*/y], DQ_STR, ['kw', kw('resource|provider|module|variable|output|data|locals|terraform|true|false|null')], ['key', /\b[\w-]+(?=\s*=)/y], NUM],
  proto: [SLASH_CMT, DQ_STR, ['kw', kw('syntax|package|import|option|message|service|rpc|returns|stream|repeated|optional|enum|oneof|map|reserved|string|int32|int64|uint32|uint64|bool|bytes|double|float|google')], NUM, TYPE],
  html: [
    ['cmt', /<!--[\s\S]*?-->/y],
    ['kw', /<\/?[A-Za-z][\w:.-]*|\/?>/y],
    ['ann', /@(?:if|else|for|switch|case|defer|empty|let)\b|\*ng\w+|\[\(?[\w.-]+\)?\]|\(\w[\w.-]*\)/y],
    ['key', /\b[\w:-]+(?==)/y],
    DQ_STR,
    SQ_STR,
    ['fn', /\{\{[\s\S]*?\}\}/y],
  ],
  css: [['cmt', /\/\*[\s\S]*?\*\//y], ['key', /[\w-]+(?=\s*:)/y], ['ann', /@[\w-]+/y], DQ_STR, SQ_STR, ['num', /#[\da-fA-F]{3,8}\b|\b\d+(\.\d+)?(px|rem|em|%|vh|vw|s|ms)?\b/y]],
  properties: [HASH_CMT, ['key', /(?<=^|\n)[A-Za-z_][\w.-]*(?==)/y], ['str', /\$\{[^}]+\}|\{[^}]+\}/y]],
  xml: [['cmt', /<!--[\s\S]*?-->/y], ['kw', /<\/?[A-Za-z][\w:.-]*|\/?>/y]],
  text: [['cmt', /(?<=\s)#[^\n]*/y]],
};

/** Highlighter ringan berbasis regex. Cukup untuk snippet edukasi. */
export function highlight(code: string, lang: CodeLang): ReactNode[] {
  if (code.length > 60000) return [code];
  const rules = RULES[lang] ?? [];
  const out: ReactNode[] = [];
  let buf = '';
  let pos = 0;
  let key = 0;

  const flush = () => {
    if (buf) {
      out.push(buf);
      buf = '';
    }
  };

  outer: while (pos < code.length) {
    for (const [cls, re] of rules) {
      re.lastIndex = pos;
      const m = re.exec(code);
      if (m && m[0].length > 0) {
        flush();
        out.push(
          <span key={key++} className={`tk-${cls}`}>
            {m[0]}
          </span>,
        );
        pos += m[0].length;
        continue outer;
      }
    }
    // Lompati satu "kata" sekaligus agar \b pada aturan berikutnya tetap benar.
    const word = /[A-Za-z0-9_$]+/y;
    word.lastIndex = pos;
    const w = word.exec(code);
    if (w) {
      buf += w[0];
      pos += w[0].length;
    } else {
      buf += code[pos];
      pos += 1;
    }
  }
  flush();
  return out;
}
