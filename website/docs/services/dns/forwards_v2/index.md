--- 
title: forwards_v2
hide_title: false
hide_table_of_contents: false
keywords:
  - forwards_v2
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

GoDaddy Domains v2 API, scoped to a customer: customer_id is resolved from the GODADDY_CUSTOMER_ID environment variable when set, otherwise it is a required parameter (a WHERE value always wins). Accepts a Personal Access Token (Bearer) or a classic sso-key credential.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="forwards_v2" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.dns.forwards_v2" /></td></tr>
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

Request was successful

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
    <td><CopyableCode code="fqdn" /></td>
    <td><code>string</code></td>
    <td>The fqdn (domain or sub domain) to forward (ex somedomain.com or sub.somedomain.com)</td>
</tr>
<tr>
    <td><CopyableCode code="mask" /></td>
    <td><code>object</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="type" /></td>
    <td><code>string</code></td>
    <td>The type of forwarding to implement  - **MASKED** — Prevents the forwarded domain or subdomain URL from displaying in the browser's address bar. - **REDIRECT_PERMANENT** (default) — Redirects to the url specified in the forwardTo field using a `301 Moved Permanently` HTTP response. Tells user-agents (including search engines) that the location has permanently moved. - **REDIRECT_TEMPORARY** — Redirects to the url specified in the forwardTo field using a `302 Found` HTTP response. Tells user-agents (including search engines) that the location has temporarily moved. (MASKED, REDIRECT_PERMANENT, REDIRECT_TEMPORARY) (default: REDIRECT_PERMANENT)</td>
</tr>
<tr>
    <td><CopyableCode code="url" /></td>
    <td><code>string (url)</code></td>
    <td>Forwards http(s) traffic to this destination url (ex. http://www.somedomain.com/)</td>
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
    <td><a href="#parameter-fqdn"><code>fqdn</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-include_subs"><code>include_subs</code></a></td>
    <td>Returns the forwarding configuration for the FQDN including destination URL and redirect type. Returns 404 if no forwarding rule exists.</td>
</tr>
<tr>
    <td><a href="#create"><CopyableCode code="create" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-fqdn"><code>fqdn</code></a>, <a href="#parameter-type"><code>type</code></a>, <a href="#parameter-url"><code>url</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td></td>
    <td>Creates or replaces the forwarding configuration for the FQDN. Idempotent - replaying the same request produces the same rule. Returns 204 No Content.</td>
</tr>
<tr>
    <td><a href="#replace"><CopyableCode code="replace" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-fqdn"><code>fqdn</code></a>, <a href="#parameter-type"><code>type</code></a>, <a href="#parameter-url"><code>url</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td></td>
    <td>Updates the forwarding configuration for the FQDN. Only fields included in the request are modified. Returns 204 No Content.</td>
</tr>
<tr>
    <td><a href="#delete"><CopyableCode code="delete" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-fqdn"><code>fqdn</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td></td>
    <td>Removes the forwarding configuration for the FQDN. Returns 204 No Content.</td>
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
<tr id="parameter-customer_id">
    <td><CopyableCode code="customer_id" /></td>
    <td><code>string (uuid)</code></td>
    <td>GoDaddy customer identifier (UUID, not the numeric shopper number). Resolved from the <code>GODADDY_CUSTOMER_ID</code> environment variable when it is set (server variable, x-stackQL-envVar); otherwise required on every method of this resource. A WHERE value always takes precedence over the environment. API resellers acting on behalf of a subaccount pass the subaccount customer identifier.</td>
</tr>
<tr id="parameter-fqdn">
    <td><CopyableCode code="fqdn" /></td>
    <td><code>string</code></td>
    <td>The fully qualified domain name whose forwarding details are to be deleted.</td>
</tr>
<tr id="parameter-include_subs">
    <td><CopyableCode code="include_subs" /></td>
    <td><code>boolean</code></td>
    <td>Optionally include all sub domains if the fqdn specified is a domain and not a sub domain. (wire: includeSubs)</td>
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

Returns the forwarding configuration for the FQDN including destination URL and redirect type. Returns 404 if no forwarding rule exists.

```sql
SELECT
fqdn,
mask,
type,
url
FROM godaddy.dns.forwards_v2
WHERE fqdn = '{{ fqdn }}' -- required
AND customer_id = '{{ customer_id }}' -- required unless GODADDY_CUSTOMER_ID is set
AND include_subs = '{{ include_subs }}'
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

Creates or replaces the forwarding configuration for the FQDN. Idempotent - replaying the same request produces the same rule. Returns 204 No Content.

```sql
INSERT INTO godaddy.dns.forwards_v2 (
type,
url,
mask,
fqdn
)
SELECT 
'{{ type }}' /* required */,
'{{ url }}' /* required */,
'{{ mask }}',
'{{ fqdn }}'
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: forwards_v2
  props:
    - name: fqdn
      value: "{{ fqdn }}"
      description: Required parameter for the forwards_v2 resource.
    - name: type
      value: "{{ type }}"
      description: |
        The type of forwarding to implement
        - **MASKED** — Prevents the forwarded domain or subdomain URL from displaying in the browser's address bar.
        - **REDIRECT_PERMANENT** (default) — Redirects to the url specified in the forwardTo field using a \`301 Moved Permanently\` HTTP response. Tells user-agents (including search engines) that the location has permanently moved.
        - **REDIRECT_TEMPORARY** — Redirects to the url specified in the forwardTo field using a \`302 Found\` HTTP response. Tells user-agents (including search engines) that the location has temporarily moved.
      valid_values: ['MASKED', 'REDIRECT_PERMANENT', 'REDIRECT_TEMPORARY']
      default: REDIRECT_PERMANENT
    - name: url
      value: "{{ url }}"
      description: |
        Forwards http(s) traffic to this destination url (ex. http://www.somedomain.com/)
    - name: mask
      value:
        title: "{{ title }}"
        description: "{{ description }}"
        keywords: "{{ keywords }}"
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

Updates the forwarding configuration for the FQDN. Only fields included in the request are modified. Returns 204 No Content.

```sql
UPDATE godaddy.dns.forwards_v2
SET 
type = '{{ type }}',
url = '{{ url }}',
mask = '{{ mask }}'
WHERE 
fqdn = '{{ fqdn }}' --required
AND type = '{{ type }}' --required
AND url = '{{ url }}' --required;
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

Removes the forwarding configuration for the FQDN. Returns 204 No Content.

```sql
DELETE FROM godaddy.dns.forwards_v2
WHERE fqdn = '{{ fqdn }}' --required
AND customer_id = '{{ customer_id }}' -- required unless GODADDY_CUSTOMER_ID is set
;
```
</TabItem>
</Tabs>
