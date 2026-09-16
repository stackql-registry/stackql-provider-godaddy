--- 
title: transfers
hide_title: false
hide_table_of_contents: false
keywords:
  - transfers
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

GoDaddy Domains v1 API. Accepts a Personal Access Token (Bearer) or a classic sso-key credential.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="transfers" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="godaddy.transfers.transfers" /></td></tr>
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
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-auth_code"><code>auth_code</code></a>, <a href="#parameter-consent"><code>consent</code></a></td>
    <td><a href="#parameter-x_shopper_id"><code>x_shopper_id</code></a></td>
    <td>Initiates an inbound domain transfer from another registrar. Requires an authcode and a consent object with agreement keys. Charges a transfer fee.</td>
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
<tr id="parameter-domain">
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>Domain to transfer in</td>
</tr>
<tr id="parameter-x_shopper_id">
    <td><CopyableCode code="x_shopper_id" /></td>
    <td><code>string</code></td>
    <td>Shopper ID which owns the domain. NOTE: This is only required if you are a Reseller managing a domain purchased outside the scope of your reseller account.</td>
</tr>
</tbody>
</table>

## Lifecycle Methods

EXEC variables use wire (API) names.

<Tabs
    defaultValue="transfer_in"
    values={[
        { label: 'transfer_in', value: 'transfer_in' }
    ]}
>
<TabItem value="transfer_in">

Initiates an inbound domain transfer from another registrar. Requires an authcode and a consent object with agreement keys. Charges a transfer fee.

```sql
EXEC godaddy.transfers.transfers.transfer_in 
@domain='{{ domain }}' --required, 
@x_shopper_id='{{ x_shopper_id }}', 
@auth_code='{{ auth_code }}', 
@consent='{{ consent }}', 
@period='{{ period }}', 
@privacy='{{ privacy }}', 
@renew_auto='{{ renew_auto }}', 
@contact_admin='{{ contact_admin }}', 
@contact_billing='{{ contact_billing }}', 
@contact_registrant='{{ contact_registrant }}', 
@contact_tech='{{ contact_tech }}'
;
```
</TabItem>
</Tabs>
