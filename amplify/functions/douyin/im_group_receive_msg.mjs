import appsync from './appsync.mjs';

export default async function im_group_receive_msg(jsonBody) {

  //通用。设置预置属性，打平JSON。
  jsonBody._channel_event_id = jsonBody.log_id;
  jsonBody._event_times = jsonBody.content.create_time;
  jsonBody._channel_type = 'douyin';
  jsonBody._channel_id = jsonBody.to_user_id;
  jsonBody._event_type = jsonBody.event;
  for (let key in jsonBody.content) {
    jsonBody[key] = jsonBody.content[key];
  }
  jsonBody.user_infos.forEach((userInfo, index) => {
    if (userInfo.open_id === jsonBody.from_user_id) {
      jsonBody._douyin_openid = userInfo.open_id
      jsonBody._nick_name = userInfo.nick_name;
      jsonBody._avatar = userInfo.avatar
    }
  });
  jsonBody._group_id = jsonBody.conversation_short_id
  jsonBody._group_name = jsonBody.group_info.group_name

  //通用。删除重复属性和深度结构。
  let keysToDelete = ['log_id', 'create_time', 'to_user_id', 'event', 'from_user_id', 'conversation_short_id']
  keysToDelete.forEach(key => {
    delete jsonBody[key];
  });
  delete jsonBody.content;
  delete jsonBody.user_infos;
  delete jsonBody.group_info;
  console.log(JSON.stringify(jsonBody))


  try {
    //search tenant_id via channel_id
    const searchChannelResponse = await appsync({
      query: 'query MyQuery{listChannels(filter:{channel_id:{eq:"' + jsonBody._channel_id + '"}}){items{tenant_id}}}'
    });
    let tenant_id = searchChannelResponse.data.listChannels.items[0].tenant_id;
    console.log('tenant_id:' + tenant_id);

    //search customer_id via douyin_openid
    let customer_id;
    const searchCustomerResponse = await appsync({
      query: 'query MyQuery{listCustomers(filter:{douyin_open_id:{eq:"' + jsonBody._douyin_openid + '"}}){items{id}}}'
    });
    if (searchCustomerResponse.data.listCustomers.items.length > 0) {
      customer_id = searchCustomerResponse.data.listCustomers.items[0].id;
      console.log('update customer_id:' + customer_id);
    } else {
      //create customer if not exist
      const createCustomerResponse = await appsync({
        query: 'mutation MyMutation{createCustomer(input:{nickname:"' + jsonBody._nick_name + '",douyin_open_id:"' + jsonBody._douyin_openid + '",tenant_id:"' + tenant_id + '"}){id}}'
      });
      customer_id = createCustomerResponse.data.createCustomer.id;
      console.log('create customer_id:' + customer_id);
    }
  } catch (error) { return { statusCode: 400, body: error.message, }; }


};