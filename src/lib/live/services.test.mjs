import {test} from "node:test";
import assert from "node:assert/strict";
import {emptyServices, parseServices, publicServices, serviceTopic} from "./services.ts";
test("six distinct entries map correctly; unrelated subscription has no service", () => {
  assert.equal(serviceTopic("鼓勵"), "跟我說話");
  assert.equal(serviceTopic("提問", "人生職涯"), "人生職涯");
  assert.equal(serviceTopic("訂閱"), undefined);
  assert.deepEqual(publicServices(emptyServices()), []);
  const values = emptyServices(); values[2] = {...values[2], enabled: true, label: "Go", intro: "<script>text</script>", url: "https://example.com/path"};
  assert.deepEqual(publicServices(values), [values[2]]);
});
test("URL, duplicate, missing, type and length validation reject malformed settings", () => {
  for (const url of ["javascript:alert(1)", "http://example.com", "https://name:secret@example.com", "not-url"]) {
    const s = emptyServices(); s[0].url = url; assert.throws(() => parseServices(s));
  }
  const s = emptyServices(); s[0].enabled = true; assert.throws(() => parseServices(s));
  s[0].label = "x"; s[0].url = "https://example.com"; assert.equal(parseServices(s)[0].enabled, true);
  assert.throws(() => parseServices(s.slice(1)));
  assert.throws(() => parseServices(s.map(() => s[0])));
  s[0].intro = "x".repeat(301); assert.throws(() => parseServices(s));
});
