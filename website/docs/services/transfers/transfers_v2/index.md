--- 
title: transfers_v2
hide_title: false
hide_table_of_contents: false
keywords:
  - transfers_v2
  - transfers
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
<tr><td><b>Name</b></td><td><CopyableCode code="transfers_v2" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.transfers.transfers_v2" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

`SELECT` not supported for this resource, use `SHOW METHODS` to view available operations for the resource.


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
    <td><a href="#transfer_in"><CopyableCode code="transfer_in" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-auth_code"><code>auth_code</code></a>, <a href="#parameter-consent"><code>consent</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Initiates an inbound domain transfer from another registrar. Requires an authcode and consent object. Returns 202 - poll GET .../actions/TRANSFER until COMPLETED, FAILED, or CANCELLED.</td>
</tr>
<tr>
    <td><a href="#accept_transfer_in"><CopyableCode code="accept_transfer_in" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-auth_code"><code>auth_code</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Explicitly accepts an in-progress inbound transfer to expedite the process. Returns 202 - poll GET .../actions/TRANSFER_IN_ACCEPT until the action reaches a terminal state.</td>
</tr>
<tr>
    <td><a href="#cancel_transfer_in"><CopyableCode code="cancel_transfer_in" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Cancels an in-progress inbound transfer. Returns 202 - poll GET .../actions/TRANSFER_IN_CANCEL until the action reaches a terminal state.</td>
</tr>
<tr>
    <td><a href="#restart_transfer_in"><CopyableCode code="restart_transfer_in" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Restarts a stalled inbound transfer from the beginning. Returns 202 - poll GET .../actions/TRANSFER_IN_RESTART until the action reaches a terminal state.</td>
</tr>
<tr>
    <td><a href="#retry_transfer_in"><CopyableCode code="retry_transfer_in" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-auth_code"><code>auth_code</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Retries a failed inbound transfer with a new authorization code. Returns 202 - poll GET .../actions/TRANSFER_IN_RETRY until the action reaches a terminal state.</td>
</tr>
<tr>
    <td><a href="#transfer_out"><CopyableCode code="transfer_out" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-registrar"><code>registrar</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Initiates an outbound transfer for .uk domains. Returns 202 - poll the actions endpoint for completion.</td>
</tr>
<tr>
    <td><a href="#accept_transfer_out"><CopyableCode code="accept_transfer_out" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a></td>
    <td>Accepts a pending outbound transfer request. Returns 202 - poll GET .../actions/TRANSFER_OUT_ACCEPT until the action reaches a terminal state.</td>
</tr>
<tr>
    <td><a href="#reject_transfer_out"><CopyableCode code="reject_transfer_out" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-customer_id"><code>customer_id</code></a></td>
    <td><a href="#parameter-x_request_id"><code>x_request_id</code></a>, <a href="#parameter-reason"><code>reason</code></a></td>
    <td>Rejects a pending outbound transfer request, keeping the domain at GoDaddy. Returns 202 - poll GET .../actions/TRANSFER_OUT_REJECT until the action reaches a terminal state.</td>
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
<tr id="parameter-domain">
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>Domain to reject the transfer out for</td>
</tr>
<tr id="parameter-registrar">
    <td><CopyableCode code="registrar" /></td>
    <td><code>string</code></td>
    <td>Registrar tag to push transfer to</td>
</tr>
<tr id="parameter-x_request_id">
    <td><CopyableCode code="x_request_id" /></td>
    <td><code>string</code></td>
    <td>A client provided identifier for tracking this request.</td>
</tr>
<tr id="parameter-reason">
    <td><CopyableCode code="reason" /></td>
    <td><code>string</code></td>
    <td>Transfer out reject reason</td>
</tr>
</tbody>
</table>

## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="transfer_in"
    values={[
        { label: 'transfer_in', value: 'transfer_in' },
        { label: 'accept_transfer_in', value: 'accept_transfer_in' },
        { label: 'cancel_transfer_in', value: 'cancel_transfer_in' },
        { label: 'restart_transfer_in', value: 'restart_transfer_in' },
        { label: 'retry_transfer_in', value: 'retry_transfer_in' },
        { label: 'transfer_out', value: 'transfer_out' },
        { label: 'accept_transfer_out', value: 'accept_transfer_out' },
        { label: 'reject_transfer_out', value: 'reject_transfer_out' }
    ]}
>
<TabItem value="transfer_in">

Initiates an inbound domain transfer from another registrar. Requires an authcode and consent object. Returns 202 - poll GET .../actions/TRANSFER until COMPLETED, FAILED, or CANCELLED.

```sql
EXEC godaddy.transfers.transfers_v2.transfer_in 
@customer_id='{{ customer_id }}' --required unless GODADDY_CUSTOMER_ID is set, 
@domain='{{ domain }}' --required, 
@x_request_id='{{ x_request_id }}', 
@auth_code='{{ auth_code }}', 
@period='{{ period }}', 
@renew_auto='{{ renew_auto }}', 
@privacy='{{ privacy }}', 
@identity_document_id='{{ identity_document_id }}', 
@consent='{{ consent }}', 
@contacts='{{ contacts }}', 
@metadata='{{ metadata }}'
;
```
</TabItem>
<TabItem value="accept_transfer_in">

Explicitly accepts an in-progress inbound transfer to expedite the process. Returns 202 - poll GET .../actions/TRANSFER_IN_ACCEPT until the action reaches a terminal state.

```sql
EXEC godaddy.transfers.transfers_v2.accept_transfer_in 
@customer_id='{{ customer_id }}' --required unless GODADDY_CUSTOMER_ID is set, 
@domain='{{ domain }}' --required, 
@x_request_id='{{ x_request_id }}', 
@auth_code='{{ auth_code }}'
;
```
</TabItem>
<TabItem value="cancel_transfer_in">

Cancels an in-progress inbound transfer. Returns 202 - poll GET .../actions/TRANSFER_IN_CANCEL until the action reaches a terminal state.

```sql
EXEC godaddy.transfers.transfers_v2.cancel_transfer_in 
@customer_id='{{ customer_id }}' --required unless GODADDY_CUSTOMER_ID is set, 
@domain='{{ domain }}' --required, 
@x_request_id='{{ x_request_id }}'
;
```
</TabItem>
<TabItem value="restart_transfer_in">

Restarts a stalled inbound transfer from the beginning. Returns 202 - poll GET .../actions/TRANSFER_IN_RESTART until the action reaches a terminal state.

```sql
EXEC godaddy.transfers.transfers_v2.restart_transfer_in 
@customer_id='{{ customer_id }}' --required unless GODADDY_CUSTOMER_ID is set, 
@domain='{{ domain }}' --required, 
@x_request_id='{{ x_request_id }}'
;
```
</TabItem>
<TabItem value="retry_transfer_in">

Retries a failed inbound transfer with a new authorization code. Returns 202 - poll GET .../actions/TRANSFER_IN_RETRY until the action reaches a terminal state.

```sql
EXEC godaddy.transfers.transfers_v2.retry_transfer_in 
@customer_id='{{ customer_id }}' --required unless GODADDY_CUSTOMER_ID is set, 
@domain='{{ domain }}' --required, 
@x_request_id='{{ x_request_id }}', 
@auth_code='{{ auth_code }}'
;
```
</TabItem>
<TabItem value="transfer_out">

Initiates an outbound transfer for .uk domains. Returns 202 - poll the actions endpoint for completion.

```sql
EXEC godaddy.transfers.transfers_v2.transfer_out 
@customer_id='{{ customer_id }}' --required unless GODADDY_CUSTOMER_ID is set, 
@domain='{{ domain }}' --required, 
@registrar='{{ registrar }}' --required, 
@x_request_id='{{ x_request_id }}'
;
```
</TabItem>
<TabItem value="accept_transfer_out">

Accepts a pending outbound transfer request. Returns 202 - poll GET .../actions/TRANSFER_OUT_ACCEPT until the action reaches a terminal state.

```sql
EXEC godaddy.transfers.transfers_v2.accept_transfer_out 
@customer_id='{{ customer_id }}' --required unless GODADDY_CUSTOMER_ID is set, 
@domain='{{ domain }}' --required, 
@x_request_id='{{ x_request_id }}'
;
```
</TabItem>
<TabItem value="reject_transfer_out">

Rejects a pending outbound transfer request, keeping the domain at GoDaddy. Returns 202 - poll GET .../actions/TRANSFER_OUT_REJECT until the action reaches a terminal state.

```sql
EXEC godaddy.transfers.transfers_v2.reject_transfer_out 
@customer_id='{{ customer_id }}' --required unless GODADDY_CUSTOMER_ID is set, 
@domain='{{ domain }}' --required, 
@x_request_id='{{ x_request_id }}', 
@reason='{{ reason }}'
;
```
</TabItem>
</Tabs>
