require 'rubygems'
require 'sinatra'
require 'dm-core'
require 'json'
require 'cgi'

DataMapper.setup(:default, :host => 'localhost', :adapter => 'mysql', :username => 'root', :database => 'twitterlikker')
  
class Liking
  include DataMapper::Resource
  property :id, Serial
  property :who, String, :index => :unique
  property :permalink, String, :index => :unique
  property :created_at, DateTime
end

DataMapper::Logger.new(STDOUT, :debug)
#DataMapper.auto_upgrade!

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