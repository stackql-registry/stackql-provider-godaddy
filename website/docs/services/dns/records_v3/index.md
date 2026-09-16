--- 
title: records_v3
hide_title: false
hide_table_of_contents: false
keywords:
  - records_v3
  - dns
  - godaddy
  - infrastructure-as-code
  - configuration-as-data
  - cloud inventory
description: Query, deploy and manage godaddy resources using SQL
custom_edit_url: null
image: /img/stackql-godaddy-provider-featured-image.png
---

import CopyableCode from '@site/src/components/CopyableCode/CopyableCode';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

GoDaddy Domains v3 API (Personal Access Token only). Mutations are asynchronous and return an operation to poll via domains.operations_v3.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="records_v3" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.dns.records_v3" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="list"
    values={[
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="list">

Paginated DNS records for the zone.

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Datatype</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td>The DNS record name relative to the zone apex. Use @ to represent the zone apex itself (e.g. the bare domain example.com).  (example: www)</td>
</tr>
<tr>
    <td><CopyableCode code="record_id" /></td>
    <td><code>string</code></td>
    <td>Server-assigned identifier for this DNS record. Stable across updates. (example: rec_a1b2c3d4) (wire: recordId)</td>
</tr>
<tr>
    <td><CopyableCode code="data" /></td>
    <td><code>string</code></td>
    <td>The record value. Format is type-specific — for example, an IPv4 address for A records, or a hostname for CNAME and MX records.  (example: 93.184.216.34)</td>
</tr>
<tr>
    <td><CopyableCode code="flag" /></td>
    <td><code>integer</code></td>
    <td>Flag byte for CAA records. 0 indicates non-critical; 128 indicates critical (the issuer must understand the tag property to proceed). </td>
</tr>
<tr>
    <td><CopyableCode code="port" /></td>
    <td><code>integer</code></td>
    <td>Port number for SRV records.</td>
</tr>
<tr>
    <td><CopyableCode code="priority" /></td>
    <td><code>integer</code></td>
    <td>Priority value for MX and SRV records. Lower values are preferred.</td>
</tr>
<tr>
    <td><CopyableCode code="protocol" /></td>
    <td><code>string</code></td>
    <td>Protocol identifier for SRV records (e.g. _tcp, _udp).</td>
</tr>
<tr>
    <td><CopyableCode code="service" /></td>
    <td><code>string</code></td>
    <td>Service label for SRV records (e.g. _http).</td>
</tr>
<tr>
    <td><CopyableCode code="tag" /></td>
    <td><code>string</code></td>
    <td>Tag property for CAA records. Common values: issue, issuewild, iodef. </td>
</tr>
<tr>
    <td><CopyableCode code="ttl" /></td>
    <td><code>integer</code></td>
    <td>Time-to-live in seconds. Controls how long resolvers cache this record.</td>
</tr>
<tr>
    <td><CopyableCode code="type" /></td>
    <td><code>string</code></td>
    <td>The DNS resource record type. A — IPv4 address record. AAAA — IPv6 address record. CNAME — canonical name alias record; not permitted at the zone apex. MX — mail exchange routing record. TXT — arbitrary text record, used for SPF, DKIM, and domain verification. NS — authoritative name server delegation record. SRV — service locator record. SOA — start of authority record. CAA — certification authority authorization record.  (A, AAAA, CNAME, MX, TXT, NS, SRV, SOA, CAA) (title: DNS Record Type)</td>
</tr>
<tr>
    <td><CopyableCode code="weight" /></td>
    <td><code>integer</code></td>
    <td>Weight for SRV load balancing among records with equal priority. Higher weight increases the probability of selection. </td>
</tr>
</tbody>
</table>
</TabItem>
</Tabs>

## Methods

The following methods are available for this resource:

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Accessible by</th>
    <th>Required Params</th>
    <th>Optional Params</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-zone"><code>zone</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a>, <a href="#parameter-page"><code>page</code></a>, <a href="#parameter-page_size"><code>page_size</code></a>, <a href="#parameter-total_required"><code>total_required</code></a>, <a href="#parameter-fields"><code>fields</code></a>, <a href="#parameter-type"><code>type</code></a>, <a href="#parameter-name"><code>name</code></a></td>
    <td>Returns a paginated collection of DNS resource records for the<br />specified zone. Supports filtering by record type and host name,<br />field projection, and page-based pagination.<br /><br />Pagination uses page (1-based) and pageSize query parameters.<br />Pass totalRequired=true to include totalItems and totalPages when<br />at least one record matches; both are omitted for empty result<br />sets. Defaults to false to avoid count-query overhead.<br /><br />Filter parameters are combined with logical AND. Pagination links<br />in the response preserve active filter, pagination, and<br />field-projection parameters.<br /><br />sortBy and sortOrder are not supported. Results are always<br />returned in canonical zone-file order: resource record type (IANA<br />RR type number ascending — e.g. A before NS before CNAME), then<br />name, then data. This matches authoritative DNS ordering and is<br />not client-configurable.<br /></td>
</tr>
<tr>
    <td><a href="#create"><CopyableCode code="create" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-zone"><code>zone</code></a>, <a href="#parameter-name"><code>name</code></a>, <a href="#parameter-type"><code>type</code></a>, <a href="#parameter-data"><code>data</code></a>, <a href="#parameter-ttl"><code>ttl</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Creates a new DNS record in the GoDaddy-managed zone. Changes are applied synchronously; no operation polling required.<br /></td>
</tr>
<tr>
    <td><a href="#replace"><CopyableCode code="replace" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-zone"><code>zone</code></a>, <a href="#parameter-record_id"><code>record_id</code></a>, <a href="#parameter-name"><code>name</code></a>, <a href="#parameter-type"><code>type</code></a>, <a href="#parameter-data"><code>data</code></a>, <a href="#parameter-ttl"><code>ttl</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Fully replaces an existing DNS resource record identified by<br />recordId within the zone. All writable fields (name, type, data,<br />ttl) must be supplied; partial updates are not supported on this<br />endpoint. Changes are applied synchronously.<br /><br />GoDaddy-managed system records (SOA and NS) are read-only. When<br />recordId refers to such a record, the request fails with<br />`409 Conflict` — the record exists but cannot be modified.<br /></td>
</tr>
<tr>
    <td><a href="#delete"><CopyableCode code="delete" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-zone"><code>zone</code></a>, <a href="#parameter-record_id"><code>record_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Permanently removes a DNS resource record from the zone. The<br />recordId must refer to an existing record within the specified<br />zone. Changes are applied synchronously.<br /><br />GoDaddy-managed system records (SOA and NS) are read-only. When<br />recordId refers to such a record, the request fails with<br />`409 Conflict` — the record exists but cannot be deleted.<br /></td>
</tr>
</tbody>
</table>

## Parameters

Parameters can be passed in the `WHERE` clause of a query. Check the [Methods](#methods) section to see which parameters are required or optional for each operation.

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Datatype</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr id="parameter-record_id">
    <td><CopyableCode code="record_id" /></td>
    <td><code>string</code></td>
    <td>Server-assigned DNS record identifier within the zone. (example: Aad7oqdXCms9mlJvm_m6UFYqmwjyP20H2KBmQHgttK9kGbF_TuI3knsocArQqIv5I0Kq5C0) (wire: recordId)</td>
</tr>
<tr id="parameter-zone">
    <td><CopyableCode code="zone" /></td>
    <td><code>string</code></td>
    <td>The domain name in punycode A-label form (for example, example.com). For IDNs, use the punycode representation.  (example: example.com)</td>
</tr>
<tr id="parameter-fields">
    <td><CopyableCode code="fields" /></td>
    <td><code>string</code></td>
    <td>Comma-separated list of fields to include in each item of the response. Omitted fields are excluded from the payload. When absent, all fields are returned. Field names must match properties defined on the item schema for the operation; any unknown or invalid name returns 400 Bad Request.  (example: name,type,data,ttl)</td>
</tr>
<tr id="parameter-name">
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td>Filter results to records with this host name relative to the zone. Use `@` for the zone apex.  (example: app2)</td>
</tr>
<tr id="parameter-page">
    <td><CopyableCode code="page" /></td>
    <td><code>integer</code></td>
    <td>One-based page number for offset-based pagination. Defaults to 1.  (example: 2)</td>
</tr>
<tr id="parameter-page_size">
    <td><CopyableCode code="page_size" /></td>
    <td><code>integer</code></td>
    <td>Maximum number of items to return per page.  (example: 25) (wire: pageSize)</td>
</tr>
<tr id="parameter-total_required">
    <td><CopyableCode code="total_required" /></td>
    <td><code>boolean</code></td>
    <td>When true, the response includes totalItems and totalPages for the current filter when at least one record matches. Both are omitted when the result set is empty. Defaults to false; omitting totals avoids the cost of a count query on large collections.  (example: true) (wire: totalRequired)</td>
</tr>
<tr id="parameter-type">
    <td><CopyableCode code="type" /></td>
    <td><code>string</code></td>
    <td>Filter results to records of this DNS type. (example: A)</td>
</tr>
<tr id="parameter-x_request_id">
    <td><CopyableCode code="x_request_id" /></td>
    <td><code>string (uuid)</code></td>
    <td>Optional client-generated request correlation identifier, propagated across services and returned in the response X-Request-Id header.  (wire: X-Request-Id)</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="list"
    values={[
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="list">

Returns a paginated collection of DNS resource records for the<br />specified zone. Supports filtering by record type and host name,<br />field projection, and page-based pagination.<br /><br />Pagination uses page (1-based) and pageSize query parameters.<br />Pass totalRequired=true to include totalItems and totalPages when<br />at least one record matches; both are omitted for empty result<br />sets. Defaults to false to avoid count-query overhead.<br /><br />Filter parameters are combined with logical AND. Pagination links<br />in the response preserve active filter, pagination, and<br />field-projection parameters.<br /><br />sortBy and sortOrder are not supported. Results are always<br />returned in canonical zone-file order: resource record type (IANA<br />RR type number ascending — e.g. A before NS before CNAME), then<br />name, then data. This matches authoritative DNS ordering and is<br />not client-configurable.<br />

```sql
SELECT
name,
record_id,
data,
flag,
port,
priority,
protocol,
service,
tag,
ttl,
type,
weight
FROM godaddy.dns.records_v3
WHERE zone = '{{ zone }}' -- required
AND x_request_id = '{{ x_request_id }}'
AND page = '{{ page }}'
AND page_size = '{{ page_size }}'
AND total_required = '{{ total_required }}'
AND fields = '{{ fields }}'
AND type = '{{ type }}'
AND name = '{{ name }}'
;
```
</TabItem>
</Tabs>


## `INSERT` examples

<Tabs
    defaultValue="create"
    values={[
        { label: 'create', value: 'create' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="create">

Creates a new DNS record in the GoDaddy-managed zone. Changes are applied synchronously; no operation polling required.<br />

```sql
INSERT INTO godaddy.dns.records_v3 (
name,
type,
data,
ttl,
priority,
service,
port,
weight,
protocol,
flag,
tag,
zone,
x_request_id
)
SELECT 
'{{ name }}' /* required */,
'{{ type }}' /* required */,
'{{ data }}' /* required */,
{{ ttl }} /* required */,
{{ priority }},
'{{ service }}',
{{ port }},
{{ weight }},
'{{ protocol }}',
{{ flag }},
'{{ tag }}',
'{{ zone }}',
'{{ x_request_id }}'
RETURNING
name,
record_id,
data,
flag,
port,
priority,
protocol,
service,
tag,
ttl,
type,
weight
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: records_v3
  props:
    - name: zone
      value: "{{ zone }}"
      description: Required parameter for the records_v3 resource.
    - name: name
      value: "{{ name }}"
      description: |
        The DNS record name relative to the zone apex. Use @ to represent the zone apex itself (e.g. the bare domain example.com).
    - name: type
      value: "{{ type }}"
      description: |
        The DNS resource record type. A — IPv4 address record. AAAA — IPv6 address record. CNAME — canonical name alias record; not permitted at the zone apex. MX — mail exchange routing record. TXT — arbitrary text record, used for SPF, DKIM, and domain verification. NS — authoritative name server delegation record. SRV — service locator record. SOA — start of authority record. CAA — certification authority authorization record.
      valid_values: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'SOA', 'CAA']
    - name: data
      value: "{{ data }}"
      description: |
        The record value. Format is type-specific — for example, an IPv4 address for A records, or a hostname for CNAME and MX records.
    - name: ttl
      value: {{ ttl }}
      description: |
        Time-to-live in seconds. Controls how long resolvers cache this record.
    - name: priority
      value: {{ priority }}
      description: |
        Priority value for MX and SRV records. Lower values are preferred.
    - name: service
      value: "{{ service }}"
      description: |
        Service label for SRV records (e.g. _http).
    - name: port
      value: {{ port }}
      description: |
        Port number for SRV records.
    - name: weight
      value: {{ weight }}
      description: |
        Weight for SRV load balancing among records with equal priority. Higher weight increases the probability of selection.
    - name: protocol
      value: "{{ protocol }}"
      description: |
        Protocol identifier for SRV records (e.g. _tcp, _udp).
    - name: flag
      value: {{ flag }}
      description: |
        Flag byte for CAA records. 0 indicates non-critical; 128 indicates critical (the issuer must understand the tag property to proceed).
    - name: tag
      value: "{{ tag }}"
      description: |
        Tag property for CAA records. Common values: issue, issuewild, iodef.
    - name: x_request_id
      value: "{{ x_request_id }}"
      description: Optional client-generated request correlation identifier, propagated across services and returned in the response X-Request-Id header. 
      description: Optional client-generated request correlation identifier, propagated across services and returned in the response X-Request-Id header. 
`}</CodeBlock>

</TabItem>
</Tabs>


## `UPDATE` examples

<Tabs
    defaultValue="replace"
    values={[
        { label: 'replace', value: 'replace' }
    ]}
>
<TabItem value="replace">

Fully replaces an existing DNS resource record identified by<br />recordId within the zone. All writable fields (name, type, data,<br />ttl) must be supplied; partial updates are not supported on this<br />endpoint. Changes are applied synchronously.<br /><br />GoDaddy-managed system records (SOA and NS) are read-only. When<br />recordId refers to such a record, the request fails with<br />`409 Conflict` — the record exists but cannot be modified.<br />

```sql
UPDATE godaddy.dns.records_v3
SET 
name = '{{ name }}',
type = '{{ type }}',
data = '{{ data }}',
ttl = {{ ttl }},
priority = {{ priority }},
service = '{{ service }}',
port = {{ port }},
weight = {{ weight }},
protocol = '{{ protocol }}',
flag = {{ flag }},
tag = '{{ tag }}'
WHERE 
zone = '{{ zone }}' --required
AND record_id = '{{ record_id }}' --required
AND name = '{{ name }}' --required
AND type = '{{ type }}' --required
AND data = '{{ data }}' --required
AND ttl = '{{ ttl }}' --required
AND x_request_id = '{{ x_request_id}}'
RETURNING
name,
record_id,
data,
flag,
port,
priority,
protocol,
service,
tag,
ttl,
type,
weight;
```
</TabItem>
</Tabs>


## `DELETE` examples

<Tabs
    defaultValue="delete"
    values={[
        { label: 'delete', value: 'delete' }
    ]}
>
<TabItem value="delete">

Permanently removes a DNS resource record from the zone. The<br />recordId must refer to an existing record within the specified<br />zone. Changes are applied synchronously.<br /><br />GoDaddy-managed system records (SOA and NS) are read-only. When<br />recordId refers to such a record, the request fails with<br />`409 Conflict` — the record exists but cannot be deleted.<br />

```sql
DELETE FROM godaddy.dns.records_v3
WHERE zone = '{{ zone }}' --required
AND record_id = '{{ record_id }}' --required
AND x_request_id = '{{ x_request_id }}'
;
```
</TabItem>
</Tabs>
