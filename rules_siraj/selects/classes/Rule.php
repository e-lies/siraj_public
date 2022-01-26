<?php

  require_once 'Column.php';
  class Rule{
    // public $name ='';
    public $table ='';
    public  $auth = [],  $columns = [], $where = [], $limit = [];

    public function __construct($rule_name, $rule_data){
      $this->name = $rule_name;
      $this->table = $rule_data['table'];
      $this->auth = $rule_data['auth'];
      $this->where = isset($rule_data['where']) ? $rule_data['where'] : '';
      $this->limit = isset($rule_data['limit']) ? $rule_data['limit'] : '';
      $this->cache_delay = $rule_data['cache_delay'];
      foreach ($rule_data['columns'] as $column_label => $column_data) {
        $this->columns[$column_data['label']] = new Column($column_label, $column_data);
      }

      // foreach ($rule_data['columns'] as $column_name => $column_data) {
      //   $this->columns[$column_name] = new Column($column_name, $column_data);
      // }
    }

    public function get_name(){
      return $this->name;
    }
    public function get_table_name(){
      return $this->table;
    }
    public function get_columns(){
      return $this->columns;
    }
    public function get_column($col_name){
      $columns = $this->get_columns();
      foreach ($columns as $col) {
        if($col->col == $col_name){
          return $col;
        }
      }
      return false;
      // return ((isset($this->columns[$col_name])) ? $this->columns[$col_name] : false);
    }


  }

 ?>
