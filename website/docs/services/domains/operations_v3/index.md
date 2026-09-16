--- 
title: operations_v3
hide_title: false
hide_table_of_contents: false
keywords:
  - operations_v3
  - domains
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
<tr><td><b>Name</b></td><td><CopyableCode code="operations_v3" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.domains.operations_v3" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' }
    ]}
>
<TabItem value="get">

Current operation state.

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
    <td><CopyableCode code="operation_id" /></td>
    <td><code>string (uuid)</code></td>
    <td>A universally unique identifier (UUID) in [RFC-4122 format](https://tools.ietf.org/html/rfc4122). (example: 9f1c2e7a-4b3d-4e8f-a1c2-3d4e5f6a7b8c) (wire: operationId)</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td>A date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Note: The regular expression provides static schematic guidance but does not reject all invalid dates. (pattern: <code>^&#91;0-9&#93;&#123;4&#125;-(0&#91;1-9&#93;|1&#91;0-2&#93;)-(0&#91;1-9&#93;|&#91;1-2&#93;&#91;0-9&#93;|3&#91;0-1&#93;)&#91;T,t&#93;(&#91;0-1&#93;&#91;0-9&#93;|2&#91;0-3&#93;):&#91;0-5&#93;&#91;0-9&#93;:(&#91;0-5&#93;&#91;0-9&#93;|60)(&#91;.&#93;&#91;0-9&#93;+)?(&#91;Zz&#93;|&#91;+-&#93;&#91;0-9&#93;&#123;2&#125;:&#91;0-9&#93;&#123;2&#125;)$</code>) (wire: createdAt)</td>
</tr>
<tr>
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>The domain name this operation applies to. (example: example.com)</td>
</tr>
<tr>
    <td><CopyableCode code="error" /></td>
    <td><code>object</code></td>
    <td>The error information. (title: Error)</td>
</tr>
<tr>
    <td><CopyableCode code="links" /></td>
    <td><code>array</code></td>
    <td>HATEOAS link relations for this operation. rel=self — the canonical URL for this abstract operation view. rel=registration, rel=renewal, or rel=transfer — the same resource viewed through its concrete typed collection. rel=domain — the domain-name resource affected by this operation. </td>
</tr>
<tr>
    <td><CopyableCode code="result" /></td>
    <td><code>object</code></td>
    <td>The terminal success payload for a completed domain operation. Returned on the parent DomainOperation when status is COMPLETED. Absent for non-terminal statuses (CONFIRMED, EXECUTING) and for FAILED operations. Once status reaches COMPLETED it is terminal: result is populated, remains available on subsequent polls, and status does not revert. Interpret the fields present in result using the parent operation's type: REGISTER — expiresAt, orderId.  (title: Domain Operation Result)</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>The execution state of an asynchronous domain operation. CONFIRMED — operation has been accepted and is queued for execution. EXECUTING — operation is actively being processed by the registry or downstream systems. COMPLETED — operation finished successfully; result data is available. FAILED — operation terminated with an unrecoverable error; error detail is attached.  (title: Domain Operation Status)</td>
</tr>
<tr>
    <td><CopyableCode code="type" /></td>
    <td><code>string</code></td>
    <td>The type of asynchronous domain operation. Used to distinguish which workflow is being polled on the /operations/&#123;operationId&#125; endpoint. REGISTER — new domain registration.  (title: Domain Operation Type)</td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
    <td><code>string</code></td>
    <td>A date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). Note: The regular expression provides static schematic guidance but does not reject all invalid dates. (pattern: <code>^&#91;0-9&#93;&#123;4&#125;-(0&#91;1-9&#93;|1&#91;0-2&#93;)-(0&#91;1-9&#93;|&#91;1-2&#93;&#91;0-9&#93;|3&#91;0-1&#93;)&#91;T,t&#93;(&#91;0-1&#93;&#91;0-9&#93;|2&#91;0-3&#93;):&#91;0-5&#93;&#91;0-9&#93;:(&#91;0-5&#93;&#91;0-9&#93;|60)(&#91;.&#93;&#91;0-9&#93;+)?(&#91;Zz&#93;|&#91;+-&#93;&#91;0-9&#93;&#123;2&#125;:&#91;0-9&#93;&#123;2&#125;)$</code>) (wire: updatedAt)</td>
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
    <td><a href="#get"><CopyableCode code="get" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-operation_id"><code>operation_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Universal poll endpoint for all asynchronous domain mutations. Returns<br />the current state of the operation. Non-terminal responses include a<br />`Retry-After` header.<br /><br />Terminal statuses:<br />- `COMPLETED` — operation succeeded; `result` contains the final outcome.<br />- `FAILED` — operation terminated with an error; `error` contains detail.<br /><br />While status is non-terminal (`CONFIRMED`, `EXECUTING`), neither<br />`result` nor `error` is present. Poll until a terminal status is reached.<br /><br />The poll URL is provided in the `Location` header of the initiating 202<br />response and in `links[rel=self]`. Clients must not construct this URL<br />independently.<br /></td>
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
<tr id="parameter-operation_id">
    <td><CopyableCode code="operation_id" /></td>
    <td><code>string (uuid)</code></td>
    <td>The server-assigned operation identifier returned in the 202 response of any async domain mutation.  (example: 9f1c2e7a-4b3d-4e8f-a1c2-3d4e5f6a7b8c) (wire: operationId)</td>
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
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' }
    ]}
>
<TabItem value="get">

Universal poll endpoint for all asynchronous domain mutations. Returns<br />the current state of the operation. Non-terminal responses include a<br />`Retry-After` header.<br /><br />Terminal statuses:<br />- `COMPLETED` — operation succeeded; `result` contains the final outcome.<br />- `FAILED` — operation terminated with an error; `error` contains detail.<br /><br />While status is non-terminal (`CONFIRMED`, `EXECUTING`), neither<br />`result` nor `error` is present. Poll until a terminal status is reached.<br /><br />The poll URL is provided in the `Location` header of the initiating 202<br />response and in `links[rel=self]`. Clients must not construct this URL<br />independently.<br />

```sql
SELECT
operation_id,
created_at,
domain,
error,
links,
result,
status,
type,
updated_at
FROM godaddy.domains.operations_v3
WHERE operation_id = '{{ operation_id }}' -- required
AND x_request_id = '{{ x_request_id }}'
;
```
</TabItem>
</Tabs>
