/*
 * =============================================================
 * elliptical.$Linq
 * =============================================================
 * dynamic linq query provider
 * client-side query provider for RevStackCore.Extensions.DynamicLinq enabled backend
 *
 */

//umd pattern
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    //commonjs
    module.exports = factory(require('elliptical-class'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['elliptical-class'], factory);
  } else {
    // Browser globals (root is window)
    root.elliptical.$Linq = factory(root.elliptical.Class);
    root.returnExports = root.elliptical.$Linq;
  }
}(this, function (Class) {

  var $Linq;
  $Linq = Class.extend({

    /**
     *
     * @param {string} endpoint
     * @param {*} filter
     * @returns {string}
     */
    filter: function (endpoint, filter) {
      if (typeof filter === 'object') {
        filter = this._getFilterString(filter);
        var encodedFilter = '$filter=' + encodeURIComponent(filter);
        return (endpoint.indexOf('?') > -1) ? '&' + encodedFilter : '?' + encodedFilter;
      }
      else if(filter && filter !==''){
        var encodedFilter = '$where=' + encodeURIComponent(filter);
        return (endpoint.indexOf('?') > -1) ? '&' + encodedFilter : '?' + encodedFilter;
      }else return '';
    },

    /**
     *
     * @param {string} endpoint
     * @param {string} orderBy
     * @returns {string}
     * @public
     */
    orderBy: function (endpoint, orderBy) {
      if(orderBy.indexOf('.') > -1) orderBy=this._getNestedQueryProp(orderBy);
      orderBy=this._properCaseProp(orderBy);
      var encodedOrderBy = '$orderby=' + encodeURIComponent(orderBy);
      return (endpoint.indexOf('?') > -1) ? '&' + encodedOrderBy : '?' + encodedOrderBy;
    },

    /**
     *
     * @param endpoint
     * @param orderBy
     * @param orderByDesc
     * @returns {string}
     * @public
     */
    orderByDesc: function (endpoint, orderBy, orderByDesc) {
      if(orderByDesc.indexOf('.') > -1) orderByDesc=this._getNestedQueryProp(orderByDesc);
      orderByDesc=this._properCaseProp(orderByDesc);
      if (orderBy !== undefined) return ', ' + encodeURIComponent(orderByDesc + ' desc');
      else {
        var encodedOrderByDesc = '$orderby=' + encodeURIComponent(orderByDesc + ' desc');
        return (endpoint.indexOf('?') > -1) ? '&' + encodedOrderByDesc : '?' + encodedOrderByDesc;
      }
    },

    /**
     *
     * @param {string} endpoint
     * @param {string} top
     * @returns {string}
     * @public
     */
    top: function (endpoint, top) {
      var encodedTop = '$top=' + top;
      return (endpoint.indexOf('?') > -1) ? '&' + encodedTop : '?' + encodedTop;
    },

    /**
     *
     * @param {string} endpoint
     * @param {string} skip
     * @returns {string}
     * @public
     */
    skip: function (endpoint, skip) {
      var encodedSkip = '$skip=' + skip;
      return (endpoint.indexOf('?') > -1) ? '&' + encodedSkip : '?' + encodedSkip;
    },

    /**
     *
     * @param {string} endpoint
     * @param {object} params
     * @returns {string}
     * @public
     */
    paginate: function (endpoint, params) {
      var page = params.page,
        pageSize = params.pageSize,
        skip,
        encodedPaginate;

      if (typeof page === 'undefined' || typeof pageSize === 'undefined') return '';
      else {
        page--;
        skip = page * pageSize;
        encodedPaginate = (skip > 0) ? '$skip=' + skip + '&$top=' + pageSize + '&$count=true' : '$top=' + pageSize + '&$count=true';
        return (endpoint.indexOf('?') > -1) ? '&' + encodedPaginate : '?' + encodedPaginate;
      }
    },

    _getNestedQueryProp:function(nestedProp){
      nestedProp=nestedProp.replace(/\./g,'/');
      return nestedProp;
    },

    _properCaseProp:function(s){
      return s.charAt(0).toUpperCase() + s.slice(1);
    },

    _getFilterString: function (query) {
      //shortcode filter operation patterns
      /*
       sw_[field]==startswith
       swl_[field]==startswith, tolower
       swu_[field]==startswith, toupper
       swt_[field]==startswith, trim

       c_[field]==contains
       cl_[field]==contains,tolower
       cu_[field]==contains,toupper
       ct_[field]==contains,trim

       ew_[field]==endswith
       ewl_[field]==endswith,tolower
       ewu_[field]==endswith,toupper
       ewt_[field]==endswith,trim

       eq_[field]==equals
       eql_[field]==equals, tolower
       equ_[field]==equals,toupper
       eqt_[field]==equals,trim

       gt_[field]==greater than
       ge_[field]==greater than or equal

       lt_[field]==less than
       le_[field]==less than or equal

       ne_[field]==not equal
       nel_[field]==not equal, tolower
       neu_[field]==not equal,toupper
       net_[field]==not equal,trim

       search_
       searchsw_
       */

      //filter options array
      var arr = [];

      //supported operations Enum values
      var STARTSWITH='StartsWith';
      var CONTAINS='Contains';
      var ENDSWITH='EndsWith';
      var EQ='Eq';
      var NE='Ne';
      var GT='Gt';
      var GE='Ge';
      var LT='Lt';
      var LE='Le';
      var SQL='Sql';
      var SQLUNION='SqlUnion';

      //supported String Transforms
      var LOWER='Lower';
      var UPPER='Upper';
      var TRIM='Trim';

      for (var key in query) {
        if (query.hasOwnProperty(key)) {
          var prop;
          var value = decodeURIComponent(query[key]);
          if (key.indexOf('sw_') === 0) {
            prop = key.substring(3);
            var options={
              property:prop,
              operation:STARTSWITH,
              transform:null,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if (key.indexOf('swl_') === 0) {
            prop = key.substring(4);
            var options={
              property:prop,
              operation:STARTSWITH,
              transform:LOWER,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if(key.indexOf('swu_')===0){
            prop = key.substring(4);
            var options={
              property:prop,
              operation:STARTSWITH,
              transform:UPPER,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if(key.indexOf('swt_')===0){
            prop = key.substring(4);
            var options={
              property:prop,
              operation:STARTSWITH,
              transform:TRIM,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if (key.indexOf('c_') === 0) {
            prop = key.substring(2);
            var options={
              property:prop,
              operation:CONTAINS,
              transform:null,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if (key.indexOf('cl_') === 0) {
            prop = key.substring(3);
            var options={
              property:prop,
              operation:CONTAINS,
              transform:LOWER,
              value:value,
              sql:null

            };
            arr.push(options);

          } else if(key.indexOf('cu_')===0){
            prop = key.substring(3);
            var options={
              property:prop,
              operation:CONTAINS,
              transform:UPPER,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if(key.indexOf('ct_')===0){
            prop = key.substring(3);
            var options={
              property:prop,
              operation:CONTAINS,
              transform:TRIM,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if (key.indexOf('ew_') === 0) {
            prop = key.substring(3);
            var options={
              property:prop,
              operation:ENDSWITH,
              transform:null,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if (key.indexOf('ewl_')===0){
            prop = key.substring(4);
            var options={
              property:prop,
              operation:ENDSWITH,
              transform:LOWER,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if(key.indexOf('ewu_')===0){
            prop = key.substring(4);
            var options={
              property:prop,
              operation:ENDSWITH,
              transform:UPPER,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if(key.indexOf('ewt_')===0){
            prop = key.substring(4);
            var options={
              property:prop,
              operation:ENDSWITH,
              transform:TRIM,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if(key.indexOf('eq_')===0){
            prop = key.substring(3);
            var options={
              property:prop,
              operation:EQ,
              transform:null,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if (key.indexOf('eql_') === 0) {
            prop = key.substring(4);
            var options={
              property:prop,
              operation:EQ,
              transform:LOWER,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if(key.indexOf('equ_')===0){
            prop = key.substring(4);
            var options={
              property:prop,
              operation:EQ,
              transform:UPPER,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if(key.indexOf('eqt_')===0){
            prop = key.substring(4);
            var options={
              property:prop,
              operation:EQ,
              transform:TRIM,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if(key.indexOf('ne_')===0){
            prop = key.substring(3);
            var options={
              property:prop,
              operation:NE,
              transform:null,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if (key.indexOf('nel_') === 0) {
            prop = key.substring(4);
            var options={
              property:prop,
              operation:NE,
              transform:LOWER,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if(key.indexOf('neu_')===0){
            prop = key.substring(4);
            var options={
              property:prop,
              operation:NE,
              transform:UPPER,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if(key.indexOf('net_')===0){
            prop = key.substring(4);
            var options={
              property:prop,
              operation:NE,
              transform:TRIM,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if(key.indexOf('gt_')===0){
            prop = key.substring(3);
            var options={
              property:prop,
              operation:GT,
              transform:null,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if(key.indexOf('ge_')===0){
            prop = key.substring(3);
            var options={
              property:prop,
              operation:GE,
              transform:null,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if(key.indexOf('lt_')===0){
            prop = key.substring(3);
            var options={
              property:prop,
              operation:LT,
              transform:null,
              value:value,
              sql:null
            };
            arr.push(options);

          } else if(key.indexOf('le_')===0){
            prop = key.substring(3);
            var options={
              property:prop,
              operation:LE,
              transform:null,
              value:value,
              sql:null
            };
            arr.push(options);
          } else if(key.indexOf('search_')===0){
            var _value=value.toLowerCase();
            prop=key.substring(7);
            var props=prop.split("_");
            var search='';
            for(var i=0;i<props.length;i++){
              var _prop=props[i];
              _prop=this._properCaseProp(_prop);
              search =_prop + ".ToLower().Contains(@0)";
              var operation=SQLUNION;
              if(i===0) operation=SQL;
              var options={
                property:null,
                operation:operation,
                transform:null,
                value:_value,
                sql:search
              };
              arr.push(options);
            }

          } else if(key.indexOf('searchsw_')===0){
            var _value=value.toLowerCase();
            prop=key.substring(7);
            var props=prop.split("_");
            var search='';
            for(var i=0;i<props.length;i++){
              var _prop=props[i];
              _prop=this._properCaseProp(_prop);
              search =_prop + ".ToLower().StartsWith(@0)";
              var operation=SQLUNION;
              if(i===0) operation=SQL;
              var options={
                property:null,
                operation:operation,
                transform:null,
                value:_value,
                sql:search
              };
              arr.push(options);
            }

          } else if ((key.indexOf('$') !== 0) && key.toLowerCase()!=='page') {
            prop=key;
            var options={
              property:prop,
              operation:EQ,
              transform:null,
              value:value
            };
            arr.push(options);
          }
        }
      }

      //stringify the array
      var str=JSON.stringify(arr);
      return str;
    }

  }, {});

  return $Linq;


}));