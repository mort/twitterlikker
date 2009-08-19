require 'rubygems'
require 'sinatra'
require 'datamapper'
require 'json'
require 'cgi'

env = 'development'
db_conf = YAML.load(File.new("config/database.yml"))
DataMapper.setup(:default, db_conf[env])

class Liking
  include DataMapper::Resource
  property :id, Serial
  property :who, String, :index => :unique, :length => 255
  property :permalink, URI, :index => :unique, :length => 255
  property :created_at, DateTime
end


DataMapper::Logger.new(STDOUT, :debug)
#DataMapper.auto_migrate!

post '/likings' do
  @liking = Liking.new
  @liking.who = params[:who]
  @liking.permalink = params[:permalink]
  @liking.created_at = Time.now
  
  if @liking.save
    status(201)
    @liking.permalink.to_json
  end
  
end

delete '/likings' do
  @liking = Liking.first(:who => params[:who], :permalink => params[:permalink])
  if @liking
    @liking.destroy
    status(204)
  end
end


get '/likings' do
  puts params.inspect
  status(404) unless params[:p]
  
  permalinks = params[:p].split(',')
  response = {}
  
  permalinks.each do |p|
    #p = CGI::escape(p)
    results = Liking.all(Liking.permalink => p)
    unless results.empty?
      b = Array.new
      results.each do |r|
        b << r.who
      end
      response[p] = b
    end
  end
  
    mime :json, "application/json"
    content_type :json
    response.to_json unless response.empty?  
  
end


get '/external.css' do
  mime :css, 'text/css'
  content_type :css
css = <<-EOD
  div.twitterlikker_wrapper {
    margin-top: 0.4em;
    padding-top: 0.2em;
    border-top: 1px solid #EEEEEE;
    font-style: normal;
  }
  div.twitterlikker_wrapper a {
    color: blue !important;
    text-decoration: underline;
  }
  EOD
  css
end