import { test } from "node:test"
import assert from "node:assert/strict"

import { stripAuthHeaders } from "@/lib/supabase/server"

test("stripAuthHeaders removes auth-conflicting headers", () => {
  const headerPairs: Array<[string, string]> = [
    ["Authorization", "Bearer fake"],
    ["apikey", "supabase"],
    ["X-Trace-Id", "abc"],
  ]
  const sanitized = stripAuthHeaders(headerPairs)

  const lowerCaseKeys = Object.keys(sanitized).map((key) => key.toLowerCase())
  assert.equal(lowerCaseKeys.includes("authorization"), false)
  assert.equal(lowerCaseKeys.includes("apikey"), false)
  assert.deepEqual(sanitized, { "X-Trace-Id": "abc" })
})

test("stripAuthHeaders preserves non-conflicting headers from Headers input", () => {
  const incoming = new Headers()
  incoming.set("Authorization", "Bearer something")
  incoming.set("apikey", "key")
  incoming.set("X-Client-Info", "custom-client")
  incoming.set("x-request-id", "req-1")

  const sanitized = stripAuthHeaders(incoming)

  assert.ok(!("authorization" in sanitized))
  assert.ok(!("apikey" in sanitized))
  assert.equal(sanitized["x-client-info"], "custom-client")
  assert.equal(sanitized["x-request-id"], "req-1")
})

test("stripAuthHeaders handles plain object input", () => {
  const sanitized = stripAuthHeaders({
    Authorization: "Bearer should-go",
    apikey: "should-go",
    "X-Request-Id": "req-2",
  })

  assert.deepEqual(sanitized, { "X-Request-Id": "req-2" })
})
